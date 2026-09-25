export interface DuplicateMatch {
  isDuplicate: boolean;
  field: string;
  matchedValue: string;
  message: string;
  existingId?: string;
}

export function checkCustomerDuplicate(
  phone: string,
  existingCustomers: Array<{ id: string; name: string; phone?: string | null }>
): DuplicateMatch | null {
  if (!phone || phone.trim().length < 5) return null;
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const phoneSuffix = cleanPhone.slice(-10);

  if (phoneSuffix.length < 10) return null;

  const match = existingCustomers.find((c) => {
    if (!c.phone) return false;
    const cleanExist = c.phone.replace(/[^0-9]/g, "");
    return cleanExist.slice(-10) === phoneSuffix;
  });

  if (match) {
    return {
      isDuplicate: true,
      field: "phone",
      matchedValue: phone,
      message: `A customer named "${match.name}" already exists with phone number ${phone}.`,
      existingId: match.id,
    };
  }

  return null;
}

export function checkItemDuplicate(
  name: string,
  existingItems: Array<{ id: string; name: string }>
): DuplicateMatch | null {
  if (!name || name.trim().length < 2) return null;
  const cleanName = name.trim().toLowerCase();

  const match = existingItems.find((i) => i.name.trim().toLowerCase() === cleanName);

  if (match) {
    return {
      isDuplicate: true,
      field: "name",
      matchedValue: name,
      message: `An inventory item named "${match.name}" already exists.`,
      existingId: match.id,
    };
  }

  return null;
}
