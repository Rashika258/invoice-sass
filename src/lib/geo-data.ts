export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export const GST_STATE_CODES: Record<string, string> = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "26": "Dadra and Nagar Haveli and Daman and Diu",
  "27": "Maharashtra",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman and Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
  "97": "Other Territory",
};

export const COUNTRIES = [
  "India",
  "United States",
  "United Arab Emirates",
  "United Kingdom",
  "Canada",
  "Australia",
  "Singapore",
  "Saudi Arabia",
  "Germany",
  "France",
  "Malaysia",
  "Indonesia",
  "Thailand",
  "Philippines",
  "Vietnam",
  "Japan",
  "China",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
  "Nepal",
  "Bangladesh",
  "Sri Lanka",
  "Bhutan",
  "Maldives",
  "South Africa",
  "New Zealand",
  "Italy",
  "Spain",
  "Netherlands",
  "Switzerland",
  "Ireland",
  "Other",
] as const;

export const STATES_BY_COUNTRY: Record<string, readonly string[]> = {
  India: INDIAN_STATES,
  "United States": [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ],
  "United Arab Emirates": [
    "Abu Dhabi",
    "Ajman",
    "Dubai",
    "Fujairah",
    "Ras Al Khaimah",
    "Sharjah",
    "Umm Al-Quwain",
  ],
  "United Kingdom": [
    "England",
    "Northern Ireland",
    "Scotland",
    "Wales",
  ],
  Canada: [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Northwest Territories",
    "Nova Scotia",
    "Nunavut",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Yukon",
  ],
  Australia: [
    "Australian Capital Territory",
    "New South Wales",
    "Northern Territory",
    "Queensland",
    "South Australia",
    "Tasmania",
    "Victoria",
    "Western Australia",
  ],
  Singapore: [
    "Central Singapore",
    "North East",
    "North West",
    "South East",
    "South West",
  ],
  Germany: [
    "Baden-Württemberg",
    "Bavaria",
    "Berlin",
    "Brandenburg",
    "Bremen",
    "Hamburg",
    "Hesse",
    "Lower Saxony",
    "Mecklenburg-Vorpommern",
    "North Rhine-Westphalia",
    "Rhineland-Palatinate",
    "Saarland",
    "Saxony",
    "Saxony-Anhalt",
    "Schleswig-Holstein",
    "Thuringia",
  ],
};

/**
 * Returns available states for a given country. Defaults to India if country is not specified.
 */
export function getStatesForCountry(country?: string | null): string[] {
  if (!country) return [...INDIAN_STATES];
  const list = STATES_BY_COUNTRY[country];
  if (list && list.length > 0) {
    return [...list];
  }
  return [];
}

/**
 * Auto-detect Indian state from the first two digits of a GSTIN.
 * E.g. "27AAAPL1234F1Z5" -> "Maharashtra"
 */
export function getStateFromGstin(gstin: string): string | null {
  const clean = gstin.trim().toUpperCase();
  if (clean.length < 2) return null;
  const code = clean.substring(0, 2);
  return GST_STATE_CODES[code] || null;
}

/**
 * Lookup 2-digit GST state code from an Indian state name.
 */
export function getGstStateCode(stateName: string): string | null {
  const normalized = stateName.trim().toLowerCase();
  for (const [code, name] of Object.entries(GST_STATE_CODES)) {
    if (name.toLowerCase() === normalized) {
      return code;
    }
  }
  return null;
}
