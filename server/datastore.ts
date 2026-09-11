import fs from 'fs';
import path from 'path';

export interface StripeProductRecord {
  productId: string;
  priceId: string;
  name: string;
  currency: string;
  unitAmount: number;
  createdAt: string;
}

export interface StripeCheckoutSessionRecord {
  sessionId: string;
  priceId: string;
  url: string;
  status: 'pending' | 'completed' | 'expired' | 'failed';
  customerId?: string;
  paymentIntentId?: string;
  amountTotal?: number;
  currency?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DatastoreSchema {
  product?: StripeProductRecord;
  checkoutSessions: Record<string, StripeCheckoutSessionRecord>;
}

class StripeDatastore {
  private filePath: string;
  private data: DatastoreSchema;

  constructor() {
    this.filePath = path.resolve(process.cwd(), 'server', 'data', 'stripe_datastore.json');
    this.data = {
      checkoutSessions: {},
    };
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.checkoutSessions) {
          this.data.checkoutSessions = {};
        }
      }
    } catch {
      this.data = { checkoutSessions: {} };
    }
  }

  private persist(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write datastore to disk:', err);
    }
  }

  public saveProduct(product: StripeProductRecord): void {
    this.data.product = product;
    this.persist();
  }

  public getProduct(): StripeProductRecord | undefined {
    return this.data.product;
  }

  public saveCheckoutSession(session: StripeCheckoutSessionRecord): void {
    this.data.checkoutSessions[session.sessionId] = session;
    this.persist();
  }

  public updateCheckoutSessionStatus(
    sessionId: string,
    updates: Partial<StripeCheckoutSessionRecord>
  ): StripeCheckoutSessionRecord | undefined {
    const existing = this.data.checkoutSessions[sessionId];
    if (existing) {
      const updated = { ...existing, ...updates };
      this.data.checkoutSessions[sessionId] = updated;
      this.persist();
      return updated;
    }
    return undefined;
  }

  public getCheckoutSession(sessionId: string): StripeCheckoutSessionRecord | undefined {
    return this.data.checkoutSessions[sessionId];
  }

  public getAllSessions(): StripeCheckoutSessionRecord[] {
    return Object.values(this.data.checkoutSessions);
  }
}

export const datastore = new StripeDatastore();
