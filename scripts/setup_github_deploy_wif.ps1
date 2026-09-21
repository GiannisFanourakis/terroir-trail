param(
  [string]$ProjectId = "terroir-trail",
  [string]$ProjectNumber = "536226653448",
  [string]$Repository = "GiannisFanourakis/terroir-trail"
)

$ErrorActionPreference = "Stop"

$PoolId = "github-actions"
$ProviderId = "terroir-trail"
$DeployerName = "terroirtrail-github-deployer"
$DeployerSa = "$DeployerName@$ProjectId.iam.gserviceaccount.com"
$RuntimeSa = "$ProjectNumber-compute@developer.gserviceaccount.com"

function Invoke-Gcloud {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  & gcloud @Args
  if ($LASTEXITCODE -ne 0) {
    throw "gcloud command failed"
  }
}

Write-Host "Configuring keyless GitHub Actions deployment for $Repository..."
Invoke-Gcloud config set project $ProjectId

Invoke-Gcloud services enable iamcredentials.googleapis.com sts.googleapis.com run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com firebasehosting.googleapis.com firebaserules.googleapis.com firestore.googleapis.com --project=$ProjectId

& gcloud iam service-accounts describe $DeployerSa --project=$ProjectId *> $null
if ($LASTEXITCODE -ne 0) {
  Invoke-Gcloud iam service-accounts create $DeployerName --project=$ProjectId --display-name="TerroirTrail GitHub production deployer"
}

& gcloud iam workload-identity-pools describe $PoolId --project=$ProjectId --location=global *> $null
if ($LASTEXITCODE -ne 0) {
  Invoke-Gcloud iam workload-identity-pools create $PoolId --project=$ProjectId --location=global --display-name="GitHub Actions"
}

& gcloud iam workload-identity-pools providers describe $ProviderId --project=$ProjectId --location=global --workload-identity-pool=$PoolId *> $null
if ($LASTEXITCODE -ne 0) {
  Invoke-Gcloud iam workload-identity-pools providers create-oidc $ProviderId --project=$ProjectId --location=global --workload-identity-pool=$PoolId --display-name="TerroirTrail main branch" --issuer-uri="https://token.actions.githubusercontent.com" --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" --attribute-condition="assertion.repository=='$Repository' && assertion.ref=='refs/heads/main'"
}

$PoolName = (& gcloud iam workload-identity-pools describe $PoolId --project=$ProjectId --location=global --format="value(name)").Trim()
if ($LASTEXITCODE -ne 0 -or -not $PoolName) {
  throw "Unable to resolve Workload Identity Pool resource name."
}

Invoke-Gcloud iam service-accounts add-iam-policy-binding $DeployerSa --project=$ProjectId --role=roles/iam.workloadIdentityUser --member="principalSet://iam.googleapis.com/$PoolName/attribute.repository/$Repository"

$ProjectRoles = @(
  "roles/run.sourceDeveloper",
  "roles/serviceusage.serviceUsageConsumer",
  "roles/firebasehosting.admin",
  "roles/serviceusage.apiKeysViewer",
  "roles/firebaserules.admin",
  "roles/datastore.indexAdmin"
)

foreach ($Role in $ProjectRoles) {
  Invoke-Gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$DeployerSa" --role=$Role --condition=None --quiet
}

Invoke-Gcloud iam service-accounts add-iam-policy-binding $RuntimeSa --project=$ProjectId --member="serviceAccount:$DeployerSa" --role=roles/iam.serviceAccountUser --quiet
Invoke-Gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$RuntimeSa" --role=roles/run.builder --condition=None --quiet

$ProviderName = (& gcloud iam workload-identity-pools providers describe $ProviderId --project=$ProjectId --location=global --workload-identity-pool=$PoolId --format="value(name)").Trim()

Write-Host ""
Write-Host "GitHub OIDC deployment identity is ready."
Write-Host "Provider: $ProviderName"
Write-Host "Service account: $DeployerSa"
Write-Host ""
Write-Host "No service-account JSON key was created."
