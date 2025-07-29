import precos from './precos_m2_concelhos.json';

/**
 * Mapeamento de concelhos (municípios) para o preço médio por metro
 * quadrado. O ficheiro `precos_m2_concelhos.json` contém um array de
 * objectos com as propriedades `Concelho` e `Preço médio €/m²`. Este
 * código converte esse array num dicionário para acesso rápido.
 */
export const pricePerMunicipality: Record<string, number> = {};
if (Array.isArray(precos)) {
  for (const item of precos as any[]) {
    const concelho = (item['Concelho'] as string) ?? '';
    const valor = (item['Preço médio €/m²'] as number) ?? 0;
    if (concelho && !Number.isNaN(valor)) {
      pricePerMunicipality[concelho] = valor;
    }
  }
}

/**
 * Devolve o preço por metro quadrado para o concelho indicado. Caso
 * não exista um valor específico para esse concelho, devolve 1500 €/m²
 * como valor default.
 *
 * @param municipality Nome do concelho
 */
export function getPricePerSquareMeter(municipality: string): number {
  return pricePerMunicipality[municipality] ?? 1500;
}