# PMP Trainer question schema v2

This schema separates **presentation format** from **response mode**.

## Core fields
- `id`: unique question id
- `domain`: PMP domain
- `taskCode`: PMP task code
- `task`: PMP task label
- `tags`: array of tags
- `difficulty`: `Easy | Medium | Hard`
- `format`: `standard | case | exhibit`
- `selectionMode`: `single | multiple`
- `question`: question stem
- `options`: answer options, usually as strings
- `correctAnswers`: zero-based indexes matching `options`
- `explanation`: rationale

## Case-specific fields
- `caseSetId`: shared id for linked case questions
- `caseTitle`: optional case title
- `caseText`: shared scenario text

## Exhibit-specific fields
- `exhibitTitle`: optional exhibit title
- `exhibitContent`: string or structured object

### Supported structured exhibit formats
#### Table
```json
{
  "kind": "table",
  "columns": ["Column A", "Column B"],
  "rows": [
    ["Value 1", "Value 2"],
    ["Value 3", "Value 4"]
  ]
}
```

#### Key-value
```json
{
  "kind": "key-value",
  "entries": [
    {"key": "Owner", "value": "PM"},
    {"key": "Status", "value": "At risk"}
  ]
}
```

#### List
```json
{
  "kind": "list",
  "items": ["Item 1", "Item 2"]
}
```

## Migration rule from old schema
- old `type: "single"` -> `format: "standard"`, `selectionMode: "single"`
- old `type: "multiple"` -> `format: "standard"`, `selectionMode: "multiple"`
- new `format: "case"` or `"exhibit"` can still use either `selectionMode`

## Files in this package
- `app.js`: updated to support schema v2 and structured exhibits while remaining backward compatible
- `questions.json`: migrated bank plus 10 new sample case/exhibit questions


## Mock exam builder
- `EXAM_CONFIG.formatTargets` controls how many `case` and `exhibit` questions the mock exam should try to include.
- The current setup targets **6 case questions** and **4 exhibit questions**, then fills the remaining slots with `standard` questions.
- If the bank does not contain enough `case` or `exhibit` questions, the exam falls back to other available questions.
- Questions sharing the same `caseSetId` are selected and shuffled as a block in the mock exam so linked case questions stay together.
