"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// 👇 Expecting countries array from lib with ALL countries
// type Country = { code: string; name: string; dialCode: string; flag?: string }
import { countries } from "@/lib/countries";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

export function PhoneInput({ value, onChange, className, required }: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState("+92"); // default
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTouched, setIsTouched] = useState(false);

  // Ensure countries are unique & sorted (defensive)
  const allCountries = useMemo(() => {
    const seen = new Set<string>();
    const list = countries.filter((c) => {
      if (!c || !c.code || !c.name || !c.dialCode) return false;
      const key = `${c.code}-${c.dialCode}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // sort by dial code numeric then name
    return list.sort((a, b) => {
      const na = parseInt(a.dialCode.replace("+", ""), 10);
      const nb = parseInt(b.dialCode.replace("+", ""), 10);
      if (na !== nb) return na - nb;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allCountries;
    return allCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(searchQuery)
    );
  }, [allCountries, searchQuery]);

  // Parse incoming value like "+92XXXXXXXXXX"
  useEffect(() => {
    if (!value) {
      setPhoneNumber("");
      return;
    }
    // longest dialCode first to match correctly (+1 vs +1242 etc.)
    const match = allCountries
      .slice()
      .sort((a, b) => b.dialCode.length - a.dialCode.length)
      .find((c) => value.startsWith(c.dialCode));
    if (match) {
      setCountryCode(match.dialCode);
      setPhoneNumber(value.slice(match.dialCode.length).replace(/\D/g, ""));
      return;
    }
    const m = value.match(/^(\+\d{1,3})/);
    if (m) {
      setCountryCode(m[1]);
      setPhoneNumber(value.slice(m[1].length).replace(/\D/g, ""));
    } else {
      setCountryCode("+92");
      setPhoneNumber(value.replace(/\D/g, ""));
    }
  }, [value, allCountries]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setPhoneNumber(digits);
    onChange(`${countryCode}${digits}`);
  };

  const handleCountryChange = (dial: string) => {
    setCountryCode(dial);
    onChange(`${dial}${phoneNumber}`);
    setSearchQuery("");
  };

  const isValid = useMemo(() => {
    if (!isTouched) return true;
    if (!phoneNumber && !required) return true;
    if (!phoneNumber) return false;
    return /^\d{4,}$/.test(phoneNumber); // at least 4 digits after code
  }, [phoneNumber, isTouched, required]);

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <div className="flex gap-2">
        <Select value={countryCode} onValueChange={handleCountryChange}>
          {/* Closed: show ONLY the dial code */}
          <SelectTrigger className="w-[92px] bg-white">
            <SelectValue placeholder="+92">
              <span>{countryCode}</span>
            </SelectValue>
          </SelectTrigger>

          {/* Use popper; high z-index to avoid overlap */}
          <SelectContent
            position="popper"
            side="bottom"
            align="start"
            className="bg-white z-[1000] max-h-[320px] overflow-hidden p-0"
          >
            {/* Sticky search */}
            <div className="sticky top-0 bg-white p-2 border-b z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by country or code…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Scrollable list with ALL countries */}
            <div className="max-h-[260px] overflow-y-auto">
              {filteredCountries.map((c) => (
                <SelectItem key={`${c.code}-${c.dialCode}`} value={c.dialCode} className="phone-select-item">
                  {/* Show flag (if provided) + dial code + name in dropdown */}
                  {c.flag ? <span className="mr-2 text-lg">{c.flag}</span> : null}
                  <span className="mr-2 font-medium">{c.dialCode}</span>
                  <span className="text-gray-600">{c.name}</span>
                </SelectItem>
              ))}
              {filteredCountries.length === 0 && (
                <div className="p-3 text-sm text-gray-500 text-center">No countries found</div>
              )}
            </div>
          </SelectContent>
        </Select>

        <Input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          onBlur={() => setIsTouched(true)}
          placeholder="Phone number"
          className="flex-1"
          required={required}
        />
      </div>

      {isTouched && !isValid && (
        <p className="text-red-500 text-sm">
          {required && !phoneNumber
            ? "Phone number is required"
            : "Please enter a valid phone number (at least 4 digits)"}
        </p>
      )}
    </div>
  );
}
