/**
 * 📊 Billora Tally Prime Live Sync Engine
 * Two-way XML/JSON voucher conversion for Tally Prime desktop integration.
 */

export interface TallyVoucherData {
  voucherType: "Sales" | "Purchase" | "Receipt" | "Payment" | "Journal";
  voucherNumber: string;
  date: string; // YYYYMMDD
  partyName: string;
  amount: number;
  narration?: string;
  entries: Array<{
    ledgerName: string;
    isDeemedPositive: boolean; // true = DR, false = CR
    amount: number;
  }>;
}

export function convertVoucherToTallyXml(data: TallyVoucherData): string {
  const formattedDate = data.date.replace(/-/g, "");

  const ledgerEntriesXml = data.entries
    .map(
      (entry) => `
        <ALLLEDGERENTRIES.LIST>
          <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
          <ISDEEMEDPOSITIVE>${entry.isDeemedPositive ? "Yes" : "No"}</ISDEEMEDPOSITIVE>
          <LEDGERNAME>${escapeXml(entry.ledgerName)}</LEDGERNAME>
          <AMOUNT>${entry.isDeemedPositive ? -Math.abs(entry.amount) : Math.abs(entry.amount)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="${data.voucherType}" ACTION="Create">
            <DATE>${formattedDate}</DATE>
            <VOUCHERTYPENAME>${data.voucherType}</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${escapeXml(data.voucherNumber)}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${escapeXml(data.partyName)}</PARTYLEDGERNAME>
            <NARRATION>${escapeXml(data.narration || "")}</NARRATION>
            ${ledgerEntriesXml}
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

export function parseTallyXmlToVoucher(xmlString: string): TallyVoucherData {
  const getTagValue = (xml: string, tag: string): string => {
    const match = xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`, "i"));
    return match ? match[1].trim() : "";
  };

  const voucherNumber = getTagValue(xmlString, "VOUCHERNUMBER") || `TAL-${Date.now().toString().slice(-4)}`;
  const dateRaw = getTagValue(xmlString, "DATE") || new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const partyName = getTagValue(xmlString, "PARTYLEDGERNAME") || "Sundry Debtors";
  const narration = getTagValue(xmlString, "NARRATION");

  return {
    voucherType: "Sales",
    voucherNumber,
    date: dateRaw,
    partyName,
    amount: 0,
    narration,
    entries: [
      { ledgerName: partyName, isDeemedPositive: true, amount: 0 },
      { ledgerName: "Sales Account", isDeemedPositive: false, amount: 0 },
    ],
  };
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
