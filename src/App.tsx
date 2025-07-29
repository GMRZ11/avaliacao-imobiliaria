import React, { useState, useMemo } from 'react';
import { OptionCard } from './components/OptionCard';
import { StepProgressBar } from './components/StepProgressBar';
import { getPricePerSquareMeter } from './data/priceData';
import {
  districtOptions,
  municipalitiesByDistrict,
  parishesByMunicipality
} from './data/locationData';

/**
 * Este componente implementa um assistente multi‑etapas para
 * recolher informações sobre um imóvel, calcular um valor estimado
 * com base nessas características e apresentar o resultado final.
 * O fluxo de perguntas adapta‑se dinamicamente de acordo com o tipo
 * de propriedade (moradia ou apartamento) e com a idade do imóvel.
 * Cada passo corresponde a uma pergunta ou grupo de inputs e está
 * estilizado para se aproximar das páginas fornecidas no Figma.
 */
export default function App() {
  /**
   * Estado para controlar o índice da etapa actual. O índice é
   * recalculado com base no array dinâmico de etapas, pelo que não
   * necessita de lógica complexa para saltar perguntas não
   * aplicáveis. 0 corresponde à primeira etapa (Tipo).
   */
  const [currentStep, setCurrentStep] = useState(0);

  // Controla se a página de boas‑vindas está visível. Inicialmente
  // mostramos o ecrã introdutório com o botão "Iniciar avaliação" e
  // apenas depois começamos o questionário propriamente dito.
  const [showWelcome, setShowWelcome] = useState(true);

  /**
   * Dados do formulário. Cada campo é inicializado de forma a
   * permitir testes de obrigatoriedade (strings vazias ou false). As
   * opções de Sim/Não são mantidas como strings para facilitar o
   * binding com os OptionCard.
   */
  const [formData, setFormData] = useState({
    propertyType: '' as '' | 'Moradia' | 'Apartamento',
    livingArea: '',
    plotArea: '',
    floor: '',
    propertyConfig: '',
    yearBuilt: '',
    // O estado de conservação agora usa valores "good" (bom) ou
    // "needs_renovation" (a precisar de obras) em vez de "renovated".
    conservationState: '' as '' | 'good' | 'needs_renovation',
    energyClass: '',
    elevator: '' as '' | 'Sim' | 'Não',
    balcony: '' as '' | 'Sim' | 'Não',
    garage: '' as '' | 'Sim' | 'Não',
    pool: '' as '' | 'Sim' | 'Não',
    garden: '' as '' | 'Sim' | 'Não',
    streetAddress: '',
    district: '',
    municipality: '',
    parish: '',
    phone: '',
    acceptsContact: false,
    wantsProfessionalEvaluation: false
  });

  /**
   * Quando o utilizador escolhe um distrito, limpamos município e
   * freguesia de modo a evitar inconsistências.
   */
  function handleDistrictChange(value: string) {
    setFormData((prev) => ({
      ...prev,
      district: value,
      municipality: '',
      parish: ''
    }));
  }

  /**
   * Quando o utilizador escolhe um município, limpamos a freguesia.
   */
  function handleMunicipalityChange(value: string) {
    setFormData((prev) => ({
      ...prev,
      municipality: value,
      parish: ''
    }));
  }

  /**
   * Determina dinamicamente a lista de etapas com base no tipo de
   * propriedade e na idade do imóvel. Desta forma o progresso
   * apresentado ao utilizador reflecte sempre o número correcto de
   * perguntas que ainda faltam.
   */
  const steps = useMemo(() => {
    const list: string[] = [];
    list.push('Tipo');
    list.push('AreaUtil');
    // Dependendo do tipo, inclui a área total (moradia) ou o piso (apartamento)
    if (formData.propertyType === 'Moradia') {
      list.push('AreaTotal');
    } else if (formData.propertyType === 'Apartamento') {
      list.push('Floor');
    }
    list.push('Tipologia');
    list.push('Ano');
    // Mostrar estado de conservação apenas se o ano de construção
    // definido e a idade for superior a 15 anos
    const yearNum = parseInt(formData.yearBuilt);
    const currentYear = new Date().getFullYear();
    if (!isNaN(yearNum) && currentYear - yearNum > 15) {
      list.push('Conservacao');
    }
    list.push('ClasseEnergetica');
    if (formData.propertyType === 'Moradia') {
      list.push('Piscina');
      list.push('Jardim');
    } else if (formData.propertyType === 'Apartamento') {
      list.push('Elevador');
      list.push('Varanda');
      list.push('Garagem');
    }
    list.push('Localizacao');
    list.push('Contacto');
    list.push('Resultado');
    return list;
  }, [formData.propertyType, formData.yearBuilt]);

  const totalSteps = steps.length;

  /**
   * Função que avança uma etapa no assistente. Utiliza o array
   * dinâmico de etapas para garantir que a navegação é linear sem
   * saltos manuais. Caso se atinja a penúltima etapa (Contacto) e
   * submeta, calculará automaticamente a avaliação.
   */
  function goToNextStep() {
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  }

  /**
   * Função que recua uma etapa. Se já estivermos na primeira etapa
   * nada acontece.
   */
  function goToPreviousStep() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  /**
   * Determina se o botão "Seguinte/Obter Avaliação" deve estar
   * desactivado. A validação é feita passo a passo com base no
   * conteúdo introduzido.
   */
  const isNextDisabled = useMemo(() => {
    const stepName = steps[currentStep];
    switch (stepName) {
      case 'Tipo':
        return formData.propertyType === '';
      case 'AreaUtil':
        return formData.livingArea.trim() === '' || Number(formData.livingArea) <= 0;
      case 'AreaTotal':
        // A área total tem de ser maior que a área útil
        return (
          formData.plotArea.trim() === '' ||
          Number(formData.plotArea) <= 0 ||
          Number(formData.plotArea) <= Number(formData.livingArea)
        );
      case 'Floor':
        return formData.floor.trim() === '' || Number(formData.floor) < 0;
      case 'Tipologia':
        return formData.propertyConfig === '';
      case 'Ano':
        return (
          formData.yearBuilt.trim() === '' ||
          isNaN(Number(formData.yearBuilt)) ||
          Number(formData.yearBuilt) < 1900 ||
          Number(formData.yearBuilt) > 2025
        );
      case 'Conservacao':
        return formData.conservationState === '';
      case 'ClasseEnergetica':
        return formData.energyClass === '';
      case 'Piscina':
        return formData.pool === '';
      case 'Jardim':
        return formData.garden === '';
      case 'Elevador':
        return formData.elevator === '';
      case 'Varanda':
        return formData.balcony === '';
      case 'Garagem':
        return formData.garage === '';
      case 'Localizacao':
        // A morada é opcional, portanto não a consideramos para validar.
        return (
          formData.district === '' ||
          formData.municipality === '' ||
          formData.parish === ''
        );
      case 'Contacto': {
        const digits = formData.phone.replace(/\D/g, '');
        return digits.length !== 9;
      }
      default:
        return false;
    }
  }, [currentStep, formData, steps]);

  /**
   * Função de cálculo do valor do imóvel. Baseia‑se numa fórmula
   * adaptada do código original fornecido pelo utilizador. Usa o
   * preço por m² a partir de uma pequena base de dados de preços e
   * aplica correcções em função da tipologia, idade, estado de
   * conservação, classe energética e comodidades.
   */
  /**
   * Calcula o valor estimado da propriedade com base nas fórmulas
   * fornecidas pelo utilizador. Existem duas fórmulas distintas: uma
   * para apartamentos e outra para moradias. Ambas utilizam o preço
   * médio por metro quadrado do concelho seleccionado e aplicam
   * factores de ajustamento consoante as características do imóvel.
   */
  function calculatePropertyValue(): number {
    const precoM2 = getPricePerSquareMeter(formData.municipality);
    const areaUtil = parseFloat(formData.livingArea) || 0;
    // Para apartamentos, a área total não é considerada; para moradias,
    // se não especificada, assume‑se igual à área útil
    const areaTotal = parseFloat(formData.plotArea || formData.livingArea) || 0;

    // Função auxiliar para obter o ajustamento da tipologia (apartamento)
    const getTipologyAdj = (tip: string): number => {
      const t = tip.toUpperCase();
      if (t === 'T0') return -0.15;
      if (t === 'T1') return -0.10;
      if (t === 'T2') return -0.05;
      if (t === 'T3') return 0;
      // T4 ou superior
      if (t.startsWith('T4')) return 0.10;
      return 0;
    };
    // Factor de tipologia para moradia (multiplicativo)
    const getTipologyFactor = (tip: string): number => {
      const t = tip.toUpperCase();
      if (t === 'T0') return 0.85;
      if (t === 'T1') return 0.90;
      if (t === 'T2') return 0.95;
      if (t === 'T3') return 1.00;
      if (t.startsWith('T4')) return 1.10;
      return 1.00;
    };
    // Ajustamento pela idade para apartamentos (aditivo)
    const getAgeAdj = (ano: string): number => {
      const year = parseInt(ano);
      if (isNaN(year)) return 0;
      const idade = new Date().getFullYear() - year;
      if (idade > 20) return -0.10;
      if (idade > 15) return -0.05;
      if (idade > 10) return 0;
      return 0.15;
    };
    // Factor de idade para moradias (multiplicativo)
    const getAgeFactor = (ano: string): number => {
      const year = parseInt(ano);
      if (isNaN(year)) return 1.00;
      const idade = new Date().getFullYear() - year;
      if (idade > 20) return 0.90;
      if (idade > 15) return 0.95;
      if (idade > 10) return 1.00;
      return 1.15;
    };
    // Ajustamento de estado (apartamento) e factor (moradia)
    const getStateAdj = (state: string): number => {
      if (state === 'good') return 0.10;
      if (state === 'needs_renovation') return -0.05;
      return 0;
    };
    const getStateFactor = (state: string): number => {
      if (state === 'good') return 1.10;
      if (state === 'needs_renovation') return 0.95;
      return 1.00;
    };
    // Ajustamento de classe energética (apartamento)
    const getClassAdj = (cl: string): number => {
      const c = cl.toUpperCase();
      if (c === 'A+') return 0.05;
      if (c === 'A' || c === 'B') return 0.02;
      return 0;
    };
    // Factor de classe energética (moradia)
    const getClassFactor = (cl: string): number => {
      const c = cl.toUpperCase();
      if (c === 'A+') return 1.05;
      if (c === 'A' || c === 'B') return 1.02;
      return 1.00;
    };
    // Ajustamento de piso (andar) para apartamento
    const getFloorAdj = (floorStr: string, elevator: string): number => {
      const floor = parseInt(floorStr);
      if (isNaN(floor)) return 0;
      if (floor === 0) return -0.05;
      if (floor === 1 || floor === 2) return 0;
      if (floor >= 3) {
        return elevator === 'Sim' ? 0.03 : -0.10;
      }
      return 0;
    };
    // Ajustamento de elevador para apartamento
    const getElevatorAdj = (floorStr: string, elevator: string): number => {
      const floor = parseInt(floorStr);
      if (isNaN(floor)) return 0;
      // +0.05 apenas se >=2.º andar E tem elevador
      return floor >= 2 && elevator === 'Sim' ? 0.05 : 0;
    };
    // Ajustamento de garagem para apartamento
    const getGarageAdj = (gar: string): number => (gar === 'Sim' ? 0.05 : 0);
    // Ajustamento de varanda para apartamento
    const getBalconyAdj = (bal: string): number => (bal === 'Sim' ? 0.02 : 0);
    // Factor de piscina para moradia
    const getPoolFactor = (pool: string): number => (pool === 'Sim' ? 1.03 : 1.00);
    // Factor de jardim para moradia
    const getGardenFactor = (garden: string): number => (garden === 'Sim' ? 1.005 : 1.00);

    if (formData.propertyType === 'Apartamento') {
      // Fórmula para apartamento:
      // Preço = Área_Útil × 1,25 × Preço_m2 × (1 + A_Tipologia + A_Ano + A_Estado + A_Classe + A_Andar + A_Elevador + A_Garagem + A_Varanda)
      const base = areaUtil * 1.25 * precoM2;
      const tipAdj = getTipologyAdj(formData.propertyConfig);
      const ageAdj = getAgeAdj(formData.yearBuilt);
      const stateAdj = getStateAdj(formData.conservationState);
      const classAdj = getClassAdj(formData.energyClass);
      const floorAdj = getFloorAdj(formData.floor, formData.elevator);
      const elevAdj = getElevatorAdj(formData.floor, formData.elevator);
      const garageAdj = getGarageAdj(formData.garage);
      const balconyAdj = getBalconyAdj(formData.balcony);
      const totalAdj = tipAdj + ageAdj + stateAdj + classAdj + floorAdj + elevAdj + garageAdj + balconyAdj;
      const price = base * (1 + totalAdj);
      return Math.round(price);
    } else if (formData.propertyType === 'Moradia') {
      // Fórmula para moradia:
      // ((Área útil × 0.75) + (Área total – Área útil) × 0.35) × Preço_m2 × Fatores
      const baseArea = (areaUtil * 0.75) + ((areaTotal - areaUtil) * 0.35);
      let factors = 1.0;
      factors *= getTipologyFactor(formData.propertyConfig);
      factors *= getAgeFactor(formData.yearBuilt);
      factors *= getStateFactor(formData.conservationState);
      factors *= getPoolFactor(formData.pool);
      factors *= getGardenFactor(formData.garden);
      factors *= getClassFactor(formData.energyClass);
      const price = baseArea * precoM2 * factors;
      return Math.round(price);
    }
    // Caso o tipo não seja reconhecido, devolver 0
    return 0;
  }

  /**
   * Memoização do valor calculado para evitar recomputações
   * desnecessárias. O valor é recalculado sempre que as entradas
   * relevantes se alteram.
   */
  const valuation = useMemo(() => {
    // Apenas calcular se já estivermos no passo de resultado ou depois
    if (steps[currentStep] !== 'Resultado') return null;
    return calculatePropertyValue();
  }, [currentStep, steps, formData]);

  /**
   * Submete os dados no passo de contacto. Aqui poderia ser feita uma
   * chamada a um serviço externo (Google Sheets, API, etc.). Depois
   * de submeter, avança para o passo de resultado.
   */
  async function handleSubmit() {
  // Preparar payload no formato esperado pelo Google Apps Script
  const morada = formData.streetAddress.trim() === '' ? '0' : formData.streetAddress;
  const ouvirPropostasStr = formData.acceptsContact ? 'Sim' : 'Não';
  const avaliacaoPresencialStr = formData.wantsProfessionalEvaluation ? 'Sim' : 'Não';

  // Comodidades
  const piscinaVal = formData.pool || 'False';
  const jardimVal = formData.garden || 'False';
  const garagemVal = formData.garage || 'False';
  const elevadorVal = formData.elevator || 'False';
  const varandaVal = formData.balcony || 'False';
  const classeEnergeticaVal = formData.energyClass || 'Sem classe';

  // Construir o payload com os mesmos nomes das colunas no Google Sheets
  const payload: Record<string, any> = {
    Distrito: formData.district,
    Concelho: formData.municipality,
    Freguesia: formData.parish,
    Morada: morada,
    Tipo: formData.propertyType,
    'Área útil': formData.livingArea,
    'Área total': formData.plotArea || formData.livingArea,
    Tipologia: formData.propertyConfig,
    'Ano construção': formData.yearBuilt,
    Estado: formData.conservationState,
    Piscina: piscinaVal,
    Jardim: jardimVal,
    Garagem: garagemVal,
    Elevador: elevadorVal,
    Varanda: varandaVal,
    'Classe energética': classeEnergeticaVal,
    Telemóvel: formData.phone,
    'Ouvir propostas': ouvirPropostasStr,
    'Avaliação presencial': avaliacaoPresencialStr,
    'Valor estimado': calculatePropertyValue()
  };

  try {
     fetch(
    'https://script.google.com/macros/s/AKfycbxlbdyakm_55UOskhazKeT_ZJXzEmi0U1eUSNdeZ8y5S3UxnglQHHUTY66AUhtfoOQIcg/exec',
    {
      method: 'POST',
      mode: 'no-cors', // Evita bloqueio CORS (mas sem resposta do servidor)
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  )
    .then(() => {
      console.log('Dados enviados para o Google Sheets (modo no-cors).');
      
    })
    .catch((err) => {
      console.error('Erro ao enviar dados para o Google Sheets:', err);
      
    });
} catch (err) {
  console.error('Erro ao iniciar envio para o Google Sheets:', err);
  
  }

  // Avança imediatamente para o resultado
  goToNextStep();
}


  /**
   * Formatador de moeda em euros para exibir o resultado com
   * separadores de milhar e sem casas decimais.
   */
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  /**
   * Renderiza o conteúdo da etapa actual de acordo com o nome
   * definido no array steps. Cada caso devolve um fragmento JSX com
   * inputs ou cards apropriados.
   */
  function renderStep() {
    const stepName = steps[currentStep];
    switch (stepName) {
      case 'Tipo':
        return (
          <>
            <h1 className="text-xl font-bold mb-4 text-center">
              Que tipo de imóvel pretende avaliar?
            </h1>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Selecione o tipo de propriedade que possui
            </p>
            <div className="space-y-4">
              <OptionCard
                value="Moradia"
                label="Moradia"
                description="Casa unifamiliar com entrada privada"
                selected={formData.propertyType === 'Moradia'}
                onSelect={(val) => setFormData((prev) => ({ ...prev, propertyType: val }))}
              />
              <OptionCard
                value="Apartamento"
                label="Apartamento"
                description="Unidade num edifício com áreas comuns"
                selected={formData.propertyType === 'Apartamento'}
                onSelect={(val) => setFormData((prev) => ({ ...prev, propertyType: val }))}
              />
            </div>
          </>
        );
      case 'AreaUtil':
        return (
          <>
            <h1 className="text-xl font-bold mb-2 text-center">
              Qual é a área útil habitável?
            </h1>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Indique a área útil em metros quadrados
            </p>
            <input
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
              placeholder="123"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-lg focus:border-primary focus:outline-none"
              value={formData.livingArea}
              onChange={(e) => setFormData((prev) => ({ ...prev, livingArea: e.target.value }))}
            />
          </>
        );
      case 'AreaTotal':
        return (
          <>
            <h1 className="text-xl font-bold mb-2 text-center">
              Qual é a área total do terreno?
            </h1>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Indique a área total em metros quadrados (incluindo terreno).
              <br />
              <span className="text-xs text-gray-500">
                O valor deve ser superior à área útil.
              </span>
            </p>
            <input
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
              placeholder="250"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-lg focus:border-primary focus:outline-none"
              value={formData.plotArea}
              onChange={(e) => setFormData((prev) => ({ ...prev, plotArea: e.target.value }))}
            />
          </>
        );
      case 'Floor':
        return (
          <>
            <h1 className="text-xl font-bold mb-2 text-center">
              Em que piso se encontra o apartamento?
            </h1>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Indique o andar/fração (0 para rés‑do‑chão)
            </p>
            <input
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
              placeholder="3"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-lg focus:border-primary focus:outline-none"
              value={formData.floor}
              onChange={(e) => setFormData((prev) => ({ ...prev, floor: e.target.value }))}
            />
          </>
        );
      case 'Tipologia':
        return (
          <>
            <h1 className="text-xl font-bold mb-4 text-center">Qual a tipologia?</h1>
            <p className="text-sm text-gray-600 mb-6 text-center">Selecione a configuração do imóvel</p>
            <div className="space-y-4">
              {['T0','T1','T2','T3','T4+'].map((tip) => (
                <OptionCard
                  key={tip}
                  value={tip as string}
                  label={tip}
                  description={tip === 'T0' ? 'Estúdio sem quartos'
                    : tip === 'T1' ? 'Um quarto'
                    : tip === 'T2' ? 'Dois quartos'
                    : tip === 'T3' ? 'Três quartos'
                    : 'Quatro ou mais quartos'}
                  selected={formData.propertyConfig === tip}
                  onSelect={(val) => setFormData((prev) => ({ ...prev, propertyConfig: val }))}
                />
              ))}
            </div>
          </>
        );
      case 'Ano':
        return (
          <>
            <h1 className="text-xl font-bold mb-2 text-center">Em que ano foi construído?</h1>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Indique o ano de construção do imóvel (entre 1900 e 2025)
            </p>
            <input
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
              placeholder="1990"
              // Restringir o intervalo de anos entre 1900 e 2025
              min={1900}
              max={2025}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-lg focus:border-primary focus:outline-none"
              value={formData.yearBuilt}
              onChange={(e) => setFormData((prev) => ({ ...prev, yearBuilt: e.target.value }))}
            />
          </>
        );
      case 'Conservacao':
        return (
          <>
            <h1 className="text-xl font-bold mb-4 text-center">Estado de conservação</h1>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Como avalia o estado geral do imóvel?
            </p>
            <div className="space-y-4">
              <OptionCard
                value="good"
                label="Bom"
                description="Imóvel em bom estado de conservação"
                selected={formData.conservationState === 'good'}
                onSelect={(val) => setFormData((prev) => ({ ...prev, conservationState: val as any }))}
              />
              <OptionCard
                value="needs_renovation"
                label="A precisar de obras"
                description="Necessita de remodelação ou reparações"
                selected={formData.conservationState === 'needs_renovation'}
                onSelect={(val) => setFormData((prev) => ({ ...prev, conservationState: val as any }))}
              />
            </div>
          </>
        );
      case 'ClasseEnergetica':
        return (
          <>
            <h1 className="text-xl font-bold mb-4 text-center">Classe energética</h1>
            <p className="text-sm text-gray-600 mb-6 text-center">Indique a classe energética do imóvel</p>
            <div className="space-y-4">
              {['A+','A','B','C','D','E'].map((cl) => (
                <OptionCard
                  key={cl}
                  value={cl as string}
                  label={cl}
                  description={cl === 'A+' ? 'Eficiência máxima' : `Classe ${cl}`}
                  selected={formData.energyClass === cl}
                  onSelect={(val) => setFormData((prev) => ({ ...prev, energyClass: val }))}
                />
              ))}
            </div>
          </>
        );
      case 'Piscina':
        return (
          <>
            <h1 className="text-xl font-bold mb-4 text-center">O imóvel possui piscina?</h1>
            <p className="text-sm text-gray-600 mb-6 text-center">Indique se a moradia tem piscina</p>
            <div className="space-y-4">
              <OptionCard
                value="Sim"
                label="Sim"
                description="Possui piscina"
                selected={formData.pool === 'Sim'}
                onSelect={(val) => setFormData((prev) => ({ ...prev, pool: val }))}
              />
              <OptionCard
                value="Não"
                label="Não"
                description="Sem piscina"
                selected={formData.pool === 'Não'}
                onSelect={(val) => setFormData((prev) => ({ ...prev, pool: val }))}
              />
            </div>
          </>
        );
      case 'Jardim':
        return (
          <>
            <h1 className="text-xl font-bold mb-4 text-center">O imóvel possui jardim?</h1>
            <p className="text-sm text-gray-600 mb-6 text-center">Indique se a moradia tem jardim</p>
            <div className="space-y-4">
              <OptionCard
                value="Sim"
                label="Sim"
                description="Possui jardim"
                selected={formData.garden === 'Sim'}
                onSelect={(val) => setFormData((prev) => ({ ...prev, garden: val }))}
              />
              <OptionCard
                value="Não"
                label="Não"
                description="Sem jardim"
                selected={formData.garden === 'Não'}
                onSelect={(val) => setFormData((prev) => ({ ...prev, garden: val }))}
              />
            </div>
          </>
        );
      case 'Elevador':
        return (
          <>
            <h1 className="text-xl font-bold mb-4 text-center">O edifício possui elevador?</h1>
            <p className="text-sm text-gray-600 mb-6 text-center">Indique se o edifício dispõe de elevador</p>
            <div className="space-y-4">
              <OptionCard
                value="Sim"
                label="Sim"
                description="Tem elevador"
                selected={formData.elevator === 'Sim'}
                onSelect={(val) => setFormData((prev) => ({ ...prev, elevator: val }))}
              />
              <OptionCard
                value="Não"
                label="Não"
                description="Não tem elevador"
                selected={formData.elevator === 'Não'}
                onSelect={(val) => setFormData((prev) => ({ ...prev, elevator: val }))}
              />
            </div>
          </>
        );
      case 'Varanda':
        return (
          <>
            <h1 className="text-xl font-bold mb-4 text-center">O apartamento possui varanda?</h1>
            <p className="text-sm text-gray-600 mb-6 text-center">Indique se o apartamento dispõe de varanda ou terraço</p>
            <div className="space-y-4">
              <OptionCard
                value="Sim"
                label="Sim"
                description="Tem varanda"
                selected={formData.balcony === 'Sim'}
                onSelect={(val) => setFormData((prev) => ({ ...prev, balcony: val }))}
              />
              <OptionCard
                value="Não"
                label="Não"
                description="Não tem varanda"
                selected={formData.balcony === 'Não'}
                onSelect={(val) => setFormData((prev) => ({ ...prev, balcony: val }))}
              />
            </div>
          </>
        );
      case 'Garagem':
        return (
          <>
            <h1 className="text-xl font-bold mb-4 text-center">O apartamento possui garagem?</h1>
            <p className="text-sm text-gray-600 mb-6 text-center">Indique se tem lugar de estacionamento ou box</p>
            <div className="space-y-4">
              <OptionCard
                value="Sim"
                label="Sim"
                description="Tem garagem"
                selected={formData.garage === 'Sim'}
                onSelect={(val) => setFormData((prev) => ({ ...prev, garage: val }))}
              />
              <OptionCard
                value="Não"
                label="Não"
                description="Não tem garagem"
                selected={formData.garage === 'Não'}
                onSelect={(val) => setFormData((prev) => ({ ...prev, garage: val }))}
              />
            </div>
          </>
        );
      case 'Localizacao':
        return (
          <>
            <h1 className="text-xl font-bold mb-4 text-center">Localização exata</h1>
            <p className="text-sm text-gray-600 mb-6 text-center">Indique a localização do seu imóvel</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="streetAddress">
                  Morada (rua/avenida)
                </label>
                <input
                  id="streetAddress"
                  type="text"
                  placeholder="Rua das Flores, 123"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:border-primary focus:outline-none"
                  value={formData.streetAddress}
                  onChange={(e) => setFormData((prev) => ({ ...prev, streetAddress: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="district">
                  Distrito
                </label>
                <select
                  id="district"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:border-primary focus:outline-none"
                  value={formData.district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {districtOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="municipality">
                  Município
                </label>
                <select
                  id="municipality"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:border-primary focus:outline-none"
                  value={formData.municipality}
                  onChange={(e) => handleMunicipalityChange(e.target.value)}
                  disabled={!formData.district}
                >
                  <option value="">Selecione</option>
                  {(municipalitiesByDistrict[formData.district] || []).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="parish">
                  Freguesia
                </label>
                <select
                  id="parish"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:border-primary focus:outline-none"
                  value={formData.parish}
                  onChange={(e) => setFormData((prev) => ({ ...prev, parish: e.target.value }))}
                  disabled={!formData.municipality}
                >
                  <option value="">Selecione</option>
                  {(parishesByMunicipality[formData.municipality] || []).map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        );
      case 'Contacto': {
        // Para mostrar mensagem de erro quando o número não é válido
        const digits = formData.phone.replace(/\D/g, '');
        const showError = digits.length > 0 && digits.length !== 9;
        return (
          <>
            <h1 className="text-xl font-bold mb-4 text-center">Contacto</h1>
            <p className="text-sm text-gray-600 mb-6 text-center">Deixe‑nos o seu contacto para receber a avaliação</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="phone">
                  Número de telefone <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+351 9XX XXX XXX"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:border-primary focus:outline-none"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            <div className="flex items-start space-x-3">
              <input
                id="acceptsContact"
                type="checkbox"
                className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                checked={formData.acceptsContact}
                onChange={(e) => setFormData((prev) => ({ ...prev, acceptsContact: e.target.checked }))}
              />
              <label htmlFor="acceptsContact" className="flex-1 text-sm text-gray-700">
                Estou aberto a receber propostas pelo meu imóvel
                <span className="block text-xs text-gray-500">
                  Ao aceitar, pode receber contactos sobre o seu imóvel
                </span>
              </label>
            </div>
            <div className="flex items-start space-x-3">
              <input
                id="wantsProfessionalEvaluation"
                type="checkbox"
                className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                checked={formData.wantsProfessionalEvaluation}
                onChange={(e) => setFormData((prev) => ({ ...prev, wantsProfessionalEvaluation: e.target.checked }))}
              />
              <label htmlFor="wantsProfessionalEvaluation" className="flex-1 text-sm text-gray-700">
                Quero uma avaliação por um profissional gratuita
                <span className="block text-xs text-gray-500">
                  Um perito qualificado entrará em contacto consigo para agendar uma avaliação presencial sem custos
                </span>
              </label>
            </div>
            </div>
            {showError && (
              <p className="mt-4 text-xs text-red-600">
                Por favor, introduza um número de telefone válido com 9 dígitos
              </p>
            )}
          </>
        );
      }
      case 'Resultado':
        return (
          <>
            <div className="flex flex-col items-center justify-center py-8">
              {/* Ícone de marca verde */}
              <div className="h-14 w-14 rounded-full bg-success flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-8 w-8 text-white"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.292a1 1 0 010 1.416l-7.5 7.5a1 1 0 01-1.416 0l-3.5-3.5a1 1 0 011.416-1.416L8.5 11.586l6.792-6.794a1 1 0 011.412 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-4 text-center">Avaliação Concluída!</h1>
              <p className="text-sm text-gray-600 mb-6 text-center">
                Baseado nas informações fornecidas, estimamos que o valor do seu imóvel seja:
              </p>
              <div className="w-full border border-primary rounded-xl bg-primary-light py-6 px-4 mb-6 flex flex-col items-center">
                <span className="text-base text-primary mb-2">O valor do seu imóvel é</span>
                <span className="text-3xl font-bold text-primary">
                  {valuation !== null ? formatCurrency(valuation) : '--'}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-6 max-w-md text-center">
                <p className="mb-3">
                  <strong>Nota:</strong> Esta é uma estimativa baseada nas características do imóvel fornecidas. Para
                  uma avaliação mais precisa, recomendamos uma avaliação presencial por um perito qualificado.
                </p>
              </div>
              <button
                type="button"
                className="w-full bg-primary text-white font-semibold py-3 rounded-xl"
                onClick={() => {
                  // Limpar dados e recomeçar
                  setFormData({
                    propertyType: '',
                    livingArea: '',
                    plotArea: '',
                    floor: '',
                    propertyConfig: '',
                    yearBuilt: '',
                    conservationState: '',
                    energyClass: '',
                    elevator: '',
                    balcony: '',
                    garage: '',
                    pool: '',
                    garden: '',
                    streetAddress: '',
                    district: '',
                    municipality: '',
                    parish: '',
                    phone: '',
                    acceptsContact: false,
                    wantsProfessionalEvaluation: false
                  });
                  setCurrentStep(0);
                }}
              >
                Nova Avaliação
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  }

  /**
   * Determina o texto do botão principal em função da etapa actual.
   * No passo de contacto mostra "Obter Avaliação", no resultado
   * "Nova Avaliação"; nos restantes "Seguinte".
   */
  const primaryButtonText = useMemo(() => {
    const stepName = steps[currentStep];
    if (stepName === 'Contacto') return 'Obter Avaliação';
    if (stepName === 'Resultado') return 'Nova Avaliação';
    return 'Seguinte';
  }, [currentStep, steps]);

  /**
   * Lida com o clique no botão principal. Consoante a etapa delega
   * para a submissão ou simplesmente avança uma etapa. No passo de
   * resultado reinicia o formulário.
   */
  function handlePrimaryButton() {
    const stepName = steps[currentStep];
    if (stepName === 'Contacto') {
      handleSubmit();
    } else if (stepName === 'Resultado') {
      // A partir do resultado, recomeçar
      setFormData({
        propertyType: '',
        livingArea: '',
        plotArea: '',
        floor: '',
        propertyConfig: '',
        yearBuilt: '',
        conservationState: '',
        energyClass: '',
        elevator: '',
        balcony: '',
        garage: '',
        pool: '',
        garden: '',
        streetAddress: '',
        district: '',
        municipality: '',
        parish: '',
        phone: '',
        acceptsContact: false,
        wantsProfessionalEvaluation: false
      });
      setCurrentStep(0);
    } else {
      goToNextStep();
    }
  }

  // Se o utilizador ainda não iniciou a avaliação, mostrar a página
  // de boas‑vindas inspirada no Figma. Esta página contém um título,
  // uma descrição, um botão de início e uma lista de benefícios.
  if (showWelcome) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-light py-8 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Descobre quanto vale a tua casa
          </h1>
          <p className="text-sm text-gray-600 mb-8 text-center">
            Descubra em menos de 1 minuto com a nossa avaliação gratuita.
          </p>
          <button
            type="button"
            className="w-full bg-primary text-white font-semibold py-3 rounded-xl mb-8"
            onClick={() => {
              setShowWelcome(false);
              setCurrentStep(0);
            }}
          >
            Iniciar avaliação
          </button>
          <div className="w-full flex justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-success"></span>
              <span>Grátis</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-primary"></span>
              <span>1 minuto</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span>
              <span>Instantâneo</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Caso o utilizador já tenha iniciado, mostrar o assistente de
  // avaliação propriamente dito.
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-neutral-light py-4 px-2">
      <div className="w-full max-w-md">
        {/* Seta de voltar mostrada em todas as etapas excepto a primeira e o resultado */}
        {currentStep > 0 && steps[currentStep] !== 'Resultado' && (
          <button
            type="button"
            onClick={goToPreviousStep}
            className="mb-4 text-primary hover:text-primary-dark flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 mr-2"
            >
              <path
                fillRule="evenodd"
                d="M12.707 15.707a1 1 0 01-1.414 0L5.586 10l5.707-5.707a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Voltar
          </button>
        )}
        {/* Barra de progresso em todas as etapas excepto o resultado */}
        {steps[currentStep] !== 'Resultado' && (
          <div className="mb-6">
            <StepProgressBar currentStep={currentStep} totalSteps={totalSteps - 1} />
          </div>
        )}
        {/* Cartão principal contendo o conteúdo do passo */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          {renderStep()}
        </div>
        {/* Botão principal. Oculto no resultado pois o próprio passo
            fornece um botão para reiniciar. */}
        {steps[currentStep] !== 'Resultado' && (
          <button
            type="button"
            className={`w-full mt-6 py-3 rounded-xl font-semibold ${isNextDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white'}`}
            onClick={handlePrimaryButton}
            disabled={isNextDisabled}
          >
            {primaryButtonText}
          </button>
        )}
      </div>
    </div>
  );
}