<script setup>
import { computed } from 'vue'

const rows = defineModel({ type: Array, default: () => [] })

const props = defineProps({
  granularityMinutes: { type: Number, default: 60 },
})

const emit = defineEmits(['import-csv'])

const displayRows = computed(() => rows.value)

function addRow() {
  rows.value = [...rows.value, { date: '', time: '', value: '' }]
}

function removeRow(index) {
  const next = rows.value.slice()
  next.splice(index, 1)
  rows.value = next
}

function onFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    emit('import-csv', String(reader.result ?? ''))
    event.target.value = ''
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="data-table">
    <div class="table-toolbar">
      <button type="button" class="btn-secondary" @click="addRow">Add row</button>
      <label class="btn-secondary file-label">
        Upload CSV
        <input type="file" accept=".csv,text/csv" hidden @change="onFileChange" />
      </label>
    </div>
    <p class="field-hint">Columns: date (YYYY-MM-DD), time (10:00 or 10 AM), value</p>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Value</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in displayRows" :key="i">
            <td><input v-model="row.date" type="text" placeholder="2026-09-01" /></td>
            <td><input v-model="row.time" type="text" placeholder="10:00" /></td>
            <td><input v-model="row.value" type="number" step="any" placeholder="5" /></td>
            <td>
              <button type="button" class="row-remove" aria-label="Remove row" @click="removeRow(i)">
                ×
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="displayRows.length === 0" class="field-hint">No rows yet. Add rows or upload a CSV.</p>
  </div>
</template>

<style scoped>
.table-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.file-label {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.table-scroll {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

th {
  text-align: left;
  padding: 0.5rem 0.65rem;
  background: var(--bg);
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

td {
  padding: 0.35rem;
  border-top: 1px solid var(--border);
}

td input {
  border: none;
  padding: 0.4rem 0.5rem;
  font-size: 0.875rem;
}

td input:focus {
  box-shadow: none;
  background: var(--accent-soft);
}

.row-remove {
  border: none;
  background: transparent;
  font-size: 1.25rem;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.row-remove:hover {
  color: var(--error);
}
</style>
