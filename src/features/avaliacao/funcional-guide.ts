export interface GuiaTeste {
  passos: string[]
  atencao?: string
}

export const TESTES_COM_CONTADOR: ReadonlySet<string> = new Set([
  'SENTAR_LEVANTAR_30S',
  'FLEXAO_COTOVELO_30S',
  'MARCHA_ESTACIONARIA_2MIN',
])

export const GUIA_TESTS: Record<string, GuiaTeste> = {
  SENTAR_LEVANTAR_30S: {
    passos: [
      'Cadeira de ~43 cm encostada na parede, sem apoios para os braços, sobre superfície estável.',
      'Aluno sentado com os pés totalmente apoiados no chão e os braços cruzados sobre o tórax — posição mantida durante todo o teste.',
      'Demonstre o movimento e deixe o aluno praticar 3 repetições antes de começar.',
      'Dê o sinal "vai": conte cada levantar e sentar totalmente em 30 segundos. A pontuação é o número de movimentos completos.',
    ],
    atencao:
      'Os pés não podem sair do chão. Interrompa imediatamente em caso de tontura ou dor.',
  },
  FLEXAO_COTOVELO_30S: {
    passos: [
      'Aluno sentado na cadeira, ligeiramente deslocado para o lado da mão que segura o halter, pés totalmente apoiados no chão.',
      'Halter de 3 a 4 kg na mão, ao longo do corpo e perpendicular ao chão, braço estendido.',
      'Dê o sinal "vai": flexione o cotovelo em amplitude total o maior número de vezes em 30 segundos.',
      'A pontuação é o total de flexões completas realizadas em 30 segundos.',
    ],
    atencao:
      'Apenas o antebraço se move: mantenha o cotovelo firme ao lado do corpo e o tronco sem balançar.',
  },
  MARCHA_ESTACIONARIA_2MIN: {
    passos: [
      'Meça a altura entre a patela e a crista ilíaca do aluno e transfira a marca para a parede com fita adesiva.',
      'Aluno em pé de frente para a marca, pronto para marchar no lugar.',
      'Dê o sinal "vai": marche elevando um joelho de cada vez até a altura marcada, sem correr.',
      'Conte um passo a cada vez que o joelho direito atinge a marca. A pontuação é o total de passos em 2 minutos.',
    ],
    atencao:
      'Mantenha a cadeira por perto e acompanhe o equilíbrio. Se o aluno parar por cansaço, encerre e anote o tempo real marchado.',
  },
  SENTAR_ALCANCAR_PES: {
    passos: [
      'Aluno sentado na beirada da cadeira. Estenda à frente a perna de melhor amplitude — a outra fica flexionada e apoiada no chão.',
      'Calcanhar no chão, tornozelo a 90° e joelho totalmente estendido, assim permanecendo durante todo o teste.',
      'Mãos sobrepostas com os dedos médios no mesmo nível: incline o tronco e alcance o máximo possível da ponta do pé. Vale 2 práticas e 2 tentativas, com o melhor escore.',
      'Ponta do pé = zero: positivo se os dedos ultrapassarem, negativo se não atingirem. Meça em cm.',
    ],
    atencao:
      'O joelho da perna estendida não pode flexionar — fique atento. Sem solavancos: movimento lento e contínuo, sem forçar a amplitude.',
  },
  ALCANCAR_COSTAS: {
    passos: [
      'O avaliado passa uma das mãos por cima do ombro e a outra por baixo, pelas costas, tentando alcançar o centro das costas.',
      'Deixe treinar antes para definir a posição preferida: a mão de melhor resultado deve passar sobre o ombro.',
      'Após 2 tentativas de aquecimento, execute 2 tentativas de teste e meça com a régua a distância entre os dedos médios.',
      'Dedos que se tocam = zero: positivo se se sobrepuserem, negativo se houver distância. Vale o melhor resultado, em cm.',
    ],
    atencao: 'Não forçar o alongamento. Interrompa se houver dor no ombro.',
  },
  LEVANTAR_CAMINHAR_2M5: {
    passos: [
      'Cadeira estável e cone a 2,5 metros, com pista livre de obstáculos. Aluno sentado no meio da cadeira: mãos sobre as coxas, um pé ligeiramente à frente do outro e tronco levemente inclinado à frente.',
      'Dê o sinal "vai" e cronometre: levantar, caminhar o mais rápido possível, contornar o cone e retornar à cadeira.',
      'Pare o cronômetro no exato momento em que o aluno sentar. Registre em décimos de segundo (ex.: 4,5 s).',
      'Após 1 tentativa de prática, execute 2 tentativas e registre o melhor tempo.',
    ],
    atencao: 'Acompanhe o aluno ao lado durante todo o percurso, pronto para apoio.',
  },
}
