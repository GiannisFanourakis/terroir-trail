update public.producers
set
  google_place_id = case id
    when 'domaine-karanika' then 'ChIJX9l0oa5xVxMRglPJ5KpuwkU'
    when 'domaine-biblia-chora' then 'ChIJh9l_wOcwqRQRtzn_AKprzo8'
    when 'thymiopoulos-naoussa' then 'ChIJS3in-tOTVxMRPLSA3w4amOQ'
    when 'siris-craft-brewery' then 'ChIJb5JrTlRRqRQRk35ZlaAr9Yo'
    else google_place_id
  end,
  google_maps_url = case id
    when 'domaine-karanika' then 'https://www.google.com/maps/place/?q=place_id:ChIJX9l0oa5xVxMRglPJ5KpuwkU'
    when 'domaine-biblia-chora' then 'https://www.google.com/maps/place/?q=place_id:ChIJh9l_wOcwqRQRtzn_AKprzo8'
    when 'thymiopoulos-naoussa' then 'https://www.google.com/maps/place/?q=place_id:ChIJS3in-tOTVxMRPLSA3w4amOQ'
    when 'siris-craft-brewery' then 'https://www.google.com/maps/place/?q=place_id:ChIJb5JrTlRRqRQRk35ZlaAr9Yo'
    else google_maps_url
  end
where (
  id = 'domaine-karanika'
  and location_status = 'verified_location'
  and phone = '+30 23860 61400'
  and google_place_id is null
) or (
  id = 'domaine-biblia-chora'
  and location_status = 'verified_location'
  and phone = '+30 25920 44974'
  and google_place_id is null
) or (
  id = 'thymiopoulos-naoussa'
  and location_status = 'verified_location'
  and phone = '+30 2331 093 604'
  and google_place_id is null
) or (
  id = 'siris-craft-brewery'
  and location_status = 'verified_location'
  and phone = '+30 2321 099 949'
  and google_place_id is null
);
