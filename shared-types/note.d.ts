export type Note = {
  // ID is the same as the firestore document ID
  id: string;

  // Unix seconds
  time: number;

  // User's email address
  // To change type to email
  user: string;

  // User's org ID
  org: string;

  // Domain/Hostname of the DNS provider, e.g. cloudflare.com
  provider: string;

  // Domain that the subdomain belongs to
  domain: string;

  // Type of DNS record
  type:
    | "CNAME"
    | "A"
    | "AAAA"
    | "TXT"
    | "MX"
    | "NS"
    | "ANAME"
    | "SPF"
    | "SOA"
    | "SRV";

  subdomain: string;

  // DNS value if any
  value: string | undefined;

  // Note cannot be empty as it defeats the purpose of the application...
  note: string;
};
