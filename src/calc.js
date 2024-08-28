export function getOrçamento(amoutValues) {
  let previewResult = 0
  if (amoutValues.suiteMaster) {
    previewResult += amoutValues.suiteMaster * 35
  }
  if (amoutValues.suite) {
    previewResult += amoutValues.suite * 30
  }
  if (amoutValues.quarto) {
    previewResult += amoutValues.quarto * 16
  }
  if (amoutValues.salaDeEstar) {
    previewResult += amoutValues.salaDeEstar * 20
  }
  if (amoutValues.escritorio) {
    previewResult += amoutValues.escritorio * 16
  }
  if (amoutValues.cozinha) {
    previewResult += amoutValues.cozinha * 20
  }
  if (amoutValues.salaDeJantar) {
    previewResult += amoutValues.salaDeJantar * 20
  }
  if (amoutValues.lavabo) {
    previewResult += amoutValues.lavabo * 3
  }
  if (amoutValues.home) {
    previewResult += amoutValues.home * 16
  }
  if (amoutValues.areaGourmet) {
    previewResult += amoutValues.areaGourmet * 40
  }
  if (amoutValues.garagemCoberta) {
    previewResult += amoutValues.garagemCoberta * 20
  }
  if (amoutValues.roupeiro) {
    previewResult += amoutValues.roupeiro * 5
  }
  if (amoutValues.deposito) {
    previewResult += amoutValues.deposito * 6
  }
  if (amoutValues.piscina) {
    previewResult += amoutValues.piscina * 40
  }

  return {
    prata: previewResult * 3000,
    ouro: previewResult * 4000,
    diamante: previewResult * 5000
  }
}

export function getOrcamentoArqCasa(amoutValues) {
  let previewResult = 0
  if (amoutValues.suiteMaster) {
    previewResult += amoutValues.suiteMaster * 35
  }
  if (amoutValues.suite) {
    previewResult += amoutValues.suite * 30
  }
  if (amoutValues.quarto) {
    previewResult += amoutValues.quarto * 16
  }
  if (amoutValues.salaDeEstar) {
    previewResult += amoutValues.salaDeEstar * 20
  }
  if (amoutValues.escritorio) {
    previewResult += amoutValues.escritorio * 16
  }
  if (amoutValues.cozinha) {
    previewResult += amoutValues.cozinha * 20
  }
  if (amoutValues.salaDeJantar) {
    previewResult += amoutValues.salaDeJantar * 20
  }
  if (amoutValues.lavabo) {
    previewResult += amoutValues.lavabo * 3
  }
  if (amoutValues.home) {
    previewResult += amoutValues.home * 16
  }
  if (amoutValues.areaGourmet) {
    previewResult += amoutValues.areaGourmet * 40
  }
  if (amoutValues.garagemCoberta) {
    previewResult += amoutValues.garagemCoberta * 20
  }
  if (amoutValues.roupeiro) {
    previewResult += amoutValues.roupeiro * 5
  }
  if (amoutValues.deposito) {
    previewResult += amoutValues.deposito * 6
  }
  if (amoutValues.piscina) {
    previewResult += amoutValues.piscina * 40
  }

  const metragemValue =
    previewResult < 25
      ? 100
      : previewResult < 100
        ? 80
        : previewResult < 200
          ? 60
          : 50

  return { value: previewResult * metragemValue, metragemTotal: previewResult }
}

export function getOrcamentoMetragram(metragrem, metroValue) {
  return metragrem * metroValue
}

export function getOrcamentoEng(quantidadeProjetos, engValue, metragem) {
  return quantidadeProjetos * engValue * metragem
}
