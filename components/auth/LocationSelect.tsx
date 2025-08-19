import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";

type GeoApi = {
  countries: () => string[];
  states: (country: string) => string[];
  cities: (country: string, state: string) => string[];
};

const FALLBACK_GEO: Record<string, Record<string, string[]>> = {
  Pakistan: {
    Punjab: ["Lahore","Rawalpindi","Faisalabad","Gujranwala","Multan"],
    Sindh: ["Karachi","Hyderabad","Sukkur"],
    "Khyber Pakhtunkhwa": ["Peshawar","Abbottabad","Mardan"],
    Balochistan: ["Quetta","Gwadar"],
    "Islamabad Capital Territory": ["Islamabad"],
  },
  "United States": {
    California: ["Los Angeles","San Francisco","San Diego","San Jose"],
    Texas: ["Houston","Austin","Dallas","San Antonio"],
    "New York": ["New York","Buffalo","Rochester"],
  },
  "United Kingdom": {
    England: ["London","Manchester","Birmingham","Leeds"],
    Scotland: ["Edinburgh","Glasgow"],
    Wales: ["Cardiff","Swansea"],
  },
};

function useGeo(): GeoApi {
  const [api, setApi] = useState<GeoApi>({
    countries: () => Object.keys(FALLBACK_GEO),
    states: (c) => Object.keys(FALLBACK_GEO[c] ?? {}),
    cities: (c, s) => (FALLBACK_GEO[c]?.[s] ?? []),
  });

  useEffect(() => {
    (async () => {
      try {
        const mod = await import("country-state-city").catch(() => null);
        if (mod && (mod as any).Country) {
          const Country: { getAllCountries: () => { name: string; isoCode: string }[] } = (mod as any).Country;
          const State: { getStatesOfCountry: (iso: string) => { name: string; isoCode: string }[] } = (mod as any).State;
          const City: { getCitiesOfState: (cIso: string, sIso: string) => { name: string }[] } = (mod as any).City;
          const all = Country.getAllCountries();
          setApi({
            countries: () => all.map((c) => c.name),
            states: (countryName) => {
              const c = all.find((x) => x.name === countryName);
              if (!c) return [];
              return State.getStatesOfCountry(c.isoCode).map((s) => s.name);
            },
            cities: (countryName, stateName) => {
              const c = all.find((x) => x.name === countryName);
              if (!c) return [];
              const s = (mod as any).State.getStatesOfCountry(c.isoCode).find((x: any) => x.name === stateName);
              if (!s) return [];
              return City.getCitiesOfState(c.isoCode, s.isoCode).map((ci) => ci.name);
            },
          });
        }
      } catch { /* keep fallback */ }
    })();
  }, []);

  return api;
}

export function LocationSelect({
  country, setCountry, province, setProvince, city, setCity,
}: {
  country: string; setCountry: (c: string) => void;
  province: string; setProvince: (p: string) => void;
  city: string; setCity: (c: string) => void;
}) {
  const geo = useGeo();

  const countries = geo.countries();
  const states = country ? geo.states(country) : [];
  const cities = country && province ? geo.cities(country, province) : [];

  const onCountry = (v: string) => { setCountry(v); setProvince(""); setCity(""); };
  const onProvince = (v: string) => { setProvince(v); setCity(""); };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-1.5">
        <Label>Country</Label>
        <select value={country} onChange={(e) => onCountry(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 text-sm">
          <option value="">Select country</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label>State / Province</Label>
        <select value={province} onChange={(e) => onProvince(e.target.value)} disabled={!country} className="w-full rounded-xl border bg-background px-3 py-2 text-sm disabled:opacity-50">
          <option value="">{country ? "Select state/province" : "Choose country first"}</option>
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label>City</Label>
        <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!province} className="w-full rounded-xl border bg-background px-3 py-2 text-sm disabled:opacity-50">
          <option value="">{province ? "Select city" : "Choose state first"}</option>
          {cities.map((ci) => <option key={ci} value={ci}>{ci}</option>)}
        </select>
      </div>
    </div>
  );
}
