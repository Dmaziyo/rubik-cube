import { Rubik } from './rubiks'
const container = document.getElementsByClassName('container')[0]
const rubikWrapper = document.getElementById('rubik-wrapper')
const shuffleBtn = document.getElementById('shuffle')
const restoreBtn = document.getElementById('restore')

if (rubikWrapper) {
  const rubiks = new Rubik(rubikWrapper)
  shuffleBtn?.addEventListener('click', () => {
    rubiks.shuffle()
  })
  restoreBtn?.addEventListener('click', () => {
    rubiks.restore()
  })

  window.addEventListener('resize', () => {
    rubiks.restore()
  })
  container.classList.add('visible')
}
