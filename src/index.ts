import { Rubik } from './rubiks'
const container = document.getElementById('container')
const shuffleBtn = document.getElementById('shuffle')
const restoreBtn = document.getElementById('restore')

if (container) {
  const rubiks = new Rubik(container)
  shuffleBtn?.addEventListener('click', () => {
    rubiks.shuffle()
  })
  restoreBtn?.addEventListener('click', () => {
    rubiks.restore()
  })
}
