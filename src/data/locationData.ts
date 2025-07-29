import freguesiasData from './Freguesias.json';

/**
 * Este módulo gera listas hierárquicas de distritos, concelhos e freguesias
 * a partir de um ficheiro JSON com toda a informação administrativa de
 * Portugal. O ficheiro `Freguesias.json` deve estar localizado na mesma
 * pasta e conter um array de objectos, onde cada objecto possui um
 * `distrito`, uma lista de `concelhos` e, para cada concelho, uma
 * lista de `freguesias`. A estrutura deste ficheiro é idêntica ao
 * fornecido pelo utilizador.
 *
 * Exemplo de elemento:
 * {
 *   "distrito": "Aveiro",
 *   "concelhos": [
 *     { "concelho": "Albergaria-a-Velha", "freguesias": ["Albergaria-a-Velha e Valmaior", ...] },
 *     ...
 *   ]
 * }
 */

export const districtOptions: string[] = [];
export const municipalitiesByDistrict: Record<string, string[]> = {};
export const parishesByMunicipality: Record<string, string[]> = {};

// Inicializar as estruturas de dados a partir do JSON importado. Se o
// ficheiro estiver vazio ou com formato inesperado, as listas
// simplesmente permanecem vazias.
if (Array.isArray(freguesiasData)) {
  for (const distritoObj of freguesiasData as any[]) {
    const distrito = distritoObj.distrito as string;
    if (!districtOptions.includes(distrito)) {
      districtOptions.push(distrito);
    }
    municipalitiesByDistrict[distrito] = [];
    for (const concelhoObj of distritoObj.concelhos as any[]) {
      const concelho = concelhoObj.concelho as string;
      municipalitiesByDistrict[distrito].push(concelho);
      // Guardar freguesias por concelho
      parishesByMunicipality[concelho] = concelhoObj.freguesias as string[];
    }
  }
  // Ordenar alfabeticamente para melhorar a experiência do utilizador
  districtOptions.sort((a, b) => a.localeCompare(b));
  for (const dist of districtOptions) {
    municipalitiesByDistrict[dist].sort((a: string, b: string) => a.localeCompare(b));
  }
  for (const concelho in parishesByMunicipality) {
    parishesByMunicipality[concelho].sort((a: string, b: string) => a.localeCompare(b));
  }
}