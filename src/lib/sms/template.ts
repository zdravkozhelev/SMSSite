export function fillTemplate(
  template: string,
  contact: { name: string | null; carPlate: string | null; inspectionDate: Date | null }
) {
  return template
    .replace(/\{name\}/g, contact.name ?? "")
    .replace(/\{plate\}/g, contact.carPlate ?? "")
    .replace(/\{date\}/g, contact.inspectionDate?.toLocaleDateString("bg-BG") ?? "");
}
