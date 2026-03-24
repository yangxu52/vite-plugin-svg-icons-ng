import ids from 'virtual:svg-icons/ids'

const el = document.getElementById('client-ready')
if (el) {
  el.textContent = `Client status: ready (ids: ${ids.length})`
}
