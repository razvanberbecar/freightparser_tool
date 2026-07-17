// Presentation metadata for the field inspector: how to group, order, and render
// the keys the backend returns. This is display-only — it never filters data.
// Any key not listed below still renders, under "Other", so an unexpected field
// from the API can never go missing.

const GROUPS = {
  cmr: [
    { id: 'parties', title: 'Parties', keys: ['shipper', 'consignee', 'carrier'] },
    {
      id: 'route',
      title: 'Route',
      keys: ['loading_place', 'loading_date', 'delivery_place'],
    },
    {
      id: 'cargo',
      title: 'Cargo',
      keys: [
        'cargo_description',
        'marks',
        'num_packages',
        'packing_method',
        'gross_weight_kg',
        'volume_m3',
        'statistical_number',
        'adr_class',
      ],
    },
    {
      id: 'instructions',
      title: 'Instructions',
      keys: [
        'sender_instructions',
        'payment_instructions',
        'cash_on_delivery',
        'special_agreements',
        'attached_docs',
      ],
    },
    { id: 'issue', title: 'Issued', keys: ['established_place', 'established_date'] },
  ],
  awb: [
    {
      id: 'parties',
      title: 'Parties',
      keys: [
        'shipper_name',
        'shipper_address',
        'consignee_name',
        'consignee_address',
        'agent_name',
        'agent_city',
      ],
    },
    {
      id: 'routing',
      title: 'Routing',
      keys: ['airport_departure', 'airport_destination', 'flight_number', 'flight_date'],
    },
    {
      id: 'cargo',
      title: 'Cargo',
      keys: [
        'cargo_description',
        'num_pieces',
        'gross_weight_kg',
        'chargeable_weight',
        'rate_class',
        'cargo_dimensions',
      ],
    },
    {
      id: 'charges',
      title: 'Charges',
      keys: [
        'declared_value_carriage',
        'declared_value_customs',
        'insurance_amount',
        'total_prepaid',
        'total_collect',
        'other_charges',
      ],
    },
    {
      id: 'handling',
      title: 'Handling & References',
      keys: ['reference_number', 'handling_info', 'accounting_info'],
    },
    { id: 'issue', title: 'Executed', keys: ['execution_date', 'execution_place'] },
  ],
}

// Keys rendered in mono and right-aligned — numbers, codes, dates.
const NUMERIC = /weight|volume|num_|pieces|packages|value|amount|total|charges|_date|number|class|dimensions/

// Keys that hold prose and get a textarea.
const MULTILINE = /address|description|instructions|agreements|marks|shipper$|consignee$|carrier$|accounting|handling|docs|special/

export const isNumeric = (key) => NUMERIC.test(key)

export const isMultiline = (key, value) =>
  MULTILINE.test(key) || (typeof value === 'string' && value.length > 48)

// Fields that are wide enough to want a full row rather than half.
export const isWide = (key, value) => isMultiline(key, value)

export const humanize = (key) =>
  key
    .replace(/_kg$/, ' (kg)')
    .replace(/_m3$/, ' (m³)')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

/**
 * Split the returned field keys into ordered, titled groups.
 * Groups with no present keys are dropped; unknown keys collect into "Other".
 */
export function groupFields(docType, fields) {
  const keys = Object.keys(fields)
  const schema = GROUPS[docType] || []
  const claimed = new Set()

  const groups = schema
    .map((group) => {
      const present = group.keys.filter((key) => {
        if (!(key in fields)) return false
        claimed.add(key)
        return true
      })
      return { ...group, keys: present }
    })
    .filter((group) => group.keys.length > 0)

  const leftover = keys.filter((key) => !claimed.has(key))
  if (leftover.length > 0) {
    groups.push({ id: 'other', title: 'Other', keys: leftover })
  }

  return groups
}
