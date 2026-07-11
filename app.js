const $ = (id) => document.getElementById(id);
const controls = ["diameter", "walls", "purity", "sw", "dw"].map($);
let family = "mwcnt";

function ssa(diameter, walls) {
  const mass = walls * diameter - 0.34 * walls * (walls - 1);
  return mass > 0 ? (1315 * diameter) / mass : 0;
}

function render() {
  const diameter = Number($("diameter").value);
  const walls = Number($("walls").value);
  const purity = Number($("purity").value) / 100;
  const sw = Number($("sw").value);
  const dw = Number($("dw").value);
  let value;
  if (family === "mwcnt") value = ssa(diameter, walls) * purity;
  else {
    const total = Math.max(1, sw + dw);
    const other = Math.max(0, 1 - sw / total - dw / total);
    value = purity * ((sw / total) * 1315 + (dw / total) * ssa(diameter, 2) + other * ssa(Math.max(4, diameter * 2), 4));
  }
  $("diameter-out").textContent = `${diameter} nm`;
  $("walls-out").textContent = `${walls} 层`;
  $("purity-out").textContent = `${(purity * 100).toFixed(1)}%`;
  $("sw-out").textContent = sw.toFixed(2);
  $("dw-out").textContent = dw.toFixed(2);
  $("result-label").textContent = `${family.toUpperCase()} 理论 BET`;
  $("result-value").textContent = value.toFixed(1);
  $("result-bar").style.width = `${Math.min(100, Math.max(8, value / 13))}%`;
}

controls.forEach((control) => control.addEventListener("input", render));
document.querySelectorAll("[data-family]").forEach((button) => button.addEventListener("click", () => {
  family = button.dataset.family;
  document.querySelectorAll("[data-family]").forEach((item) => item.classList.toggle("active", item === button));
  document.body.classList.toggle("swcnt", family === "swcnt");
  render();
}));
render();
