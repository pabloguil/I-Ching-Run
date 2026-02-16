// Mapeo King Wen: patrón binario (6 bits, línea 1=derecha a línea 6=izquierda) → número
export const KING_WEN_MAPPING = {
  "111111": 1,  "000000": 2,  "100010": 3,  "010001": 4,
  "111010": 5,  "010111": 6,  "010000": 7,  "000010": 8,
  "111011": 9,  "110111": 10, "111000": 11, "000111": 12,
  "101111": 13, "111101": 14, "001000": 15, "000100": 16,
  "100110": 17, "011001": 18, "110000": 19, "000011": 20,
  "100101": 21, "101001": 22, "000001": 23, "100000": 24,
  "100111": 25, "111001": 26, "100001": 27, "011110": 28,
  "010010": 29, "101101": 30, "001110": 31, "011100": 32,
  "001111": 33, "111100": 34, "000101": 35, "101000": 36,
  "101011": 37, "110101": 38, "001010": 39, "010100": 40,
  "110001": 41, "100011": 42, "111110": 43, "011111": 44,
  "000110": 45, "011000": 46, "010110": 47, "011010": 48,
  "101110": 49, "011101": 50, "100100": 51, "001001": 52,
  "001011": 53, "110100": 54, "101100": 55, "001101": 56,
  "011011": 57, "110110": 58, "010011": 59, "110010": 60,
  "110011": 61, "001100": 62, "101010": 63, "010101": 64,
};

// Mapeo de trigramas (3 bits, línea inferior a superior dentro del trigrama)
// El patrón binario va de línea 1 (izquierda) a línea 6 (derecha)
// Primeros 3 bits = trigrama inferior (líneas 1-3), últimos 3 = trigrama superior (líneas 4-6)
const TRIGRAMAS = {
  "111": "Cielo (Qian)",
  "000": "Tierra (Kun)",
  "100": "Trueno (Zhen)",
  "010": "Agua (Kan)",
  "001": "Montaña (Gen)",
  "110": "Lago (Dui)",
  "101": "Fuego (Li)",
  "011": "Viento (Xun)",
};

function getTrigrams(patron) {
  const lower = patron.slice(0, 3); // líneas 1-2-3
  const upper = patron.slice(3, 6); // líneas 4-5-6
  return {
    trigrama_superior: TRIGRAMAS[upper] || upper,
    trigrama_inferior: TRIGRAMAS[lower] || lower,
  };
}

// Encontrar el patrón binario para un número King Wen
function patronParaNumero(num) {
  for (const [patron, n] of Object.entries(KING_WEN_MAPPING)) {
    if (n === num) return patron;
  }
  return null;
}

function hex(num, nombre, chino, pinyin, juicio, imagen, significado) {
  const patron = patronParaNumero(num);
  const trigs = patron ? getTrigrams(patron) : { trigrama_superior: "", trigrama_inferior: "" };
  return { numero: num, nombre, chino, pinyin, ...trigs, juicio, imagen, significado };
}

export const HEXAGRAMS = {
  1: hex(1, "El Cielo", "乾", "Qián",
    "El Cielo actúa con fuerza creadora. El hombre superior se fortalece sin cesar. Sublime éxito, propiciado por la perseverancia.",
    "El movimiento del Cielo es poderoso. Así el hombre superior se hace fuerte e infatigable.",
    "Representa la fuerza creativa primordial en plena actividad. Es el momento de actuar con determinación y liderazgo. La perseverancia en lo correcto trae éxito supremo."
  ),
  2: hex(2, "La Tierra", "坤", "Kūn",
    "La Tierra es lo receptivo. Sublime éxito a través de la perseverancia de una yegua. El hombre superior, si emprende algo y trata de guiar, se pierde; pero si sigue, encuentra dirección.",
    "El estado de la Tierra es la receptividad. Así el hombre superior sustenta a todos los seres con su amplia virtud.",
    "Simboliza la receptividad y la capacidad de nutrir. Es tiempo de seguir, no de liderar. La fuerza está en la paciencia, la humildad y el apoyo generoso a los demás."
  ),
  3: hex(3, "La Dificultad Inicial", "屯", "Zhūn",
    "La dificultad inicial trae sublime éxito por la perseverancia. No debe emprenderse nada sin antes designar ayudantes.",
    "Nubes y trueno: la imagen de la dificultad inicial. Así el hombre superior actúa desenredando y poniendo orden.",
    "Como una semilla que lucha por brotar, los comienzos son difíciles pero están cargados de potencial. Busca aliados y no te apresures."
  ),
  4: hex(4, "La Necedad Juvenil", "蒙", "Méng",
    "La necedad juvenil tiene éxito. No soy yo quien busca al joven necio, el joven necio me busca a mí. Al primer oráculo doy información; si pregunta dos o tres veces, es importunidad.",
    "En lo bajo del monte brota un manantial: la imagen de la juventud. Así el hombre superior nutre su carácter siendo meticuloso en todo lo que hace.",
    "Es el momento del aprendizaje y la formación. Se necesita un maestro o guía. La inocencia puede ser valiosa si se acompaña de disposición a aprender."
  ),
  5: hex(5, "La Espera", "需", "Xū",
    "La espera. Si eres sincero, tendrás luz y éxito. La perseverancia trae buena fortuna. Es propicio cruzar las grandes aguas.",
    "Nubes ascienden al cielo: la imagen de la espera. Así el hombre superior come, bebe, y permanece sereno y de buen ánimo.",
    "La paciencia activa, no pasiva. Hay que esperar el momento oportuno con confianza interior. Aliméntate bien mientras llega tu hora de actuar."
  ),
  6: hex(6, "El Conflicto", "訟", "Sòng",
    "El conflicto. Eres sincero pero encuentras obstáculos. Una pausa cautelosa a medio camino trae buena fortuna. Ir hasta el final trae desventura.",
    "Cielo y agua van en direcciones opuestas: la imagen del conflicto. Así el hombre superior reflexiona bien antes de emprender sus asuntos.",
    "Indica tensión y disputas. No es momento de llevar las cosas al extremo. Busca mediación y compromiso. La confrontación directa traerá pérdidas."
  ),
  7: hex(7, "El Ejército", "師", "Shī",
    "El ejército necesita perseverancia y un hombre fuerte. Buena fortuna sin culpa.",
    "En medio de la tierra hay agua: la imagen del ejército. Así el hombre superior acrecienta sus multitudes siendo generoso con el pueblo.",
    "Habla de la organización, la disciplina y el liderazgo justo. Se necesita un líder experimentado y moral para guiar la acción colectiva."
  ),
  8: hex(8, "La Solidaridad", "比", "Bǐ",
    "La solidaridad trae buena fortuna. Examina el oráculo una vez más para ver si tienes sublimidad, perseverancia y constancia; entonces no habrá culpa. Los inseguros se acercan poco a poco. El que llega tarde tiene desventura.",
    "Sobre la tierra hay agua: la imagen de la solidaridad. Así los reyes de antaño otorgaban feudos y cultivaban relaciones amistosas con los señores feudales.",
    "Es tiempo de unirse y cooperar. Pero la unión debe basarse en principios correctos y un centro fuerte. No tardes en unirte a la causa justa."
  ),
  9: hex(9, "La Pequeña Acumulación", "小畜", "Xiǎo Xù",
    "La fuerza domesticadora de lo pequeño tiene éxito. Densas nubes, ninguna lluvia desde nuestra región del oeste.",
    "El viento recorre el cielo: la imagen de la fuerza domesticadora de lo pequeño. Así el hombre superior refina la forma exterior de su naturaleza.",
    "Hay acumulación de fuerza pero aún no es suficiente para una gran acción. Trabaja en los detalles y la preparación. La influencia sutil logra más que la fuerza bruta."
  ),
  10: hex(10, "El Paso Cauteloso", "履", "Lǚ",
    "Pisar la cola del tigre. Este no muerde al hombre. Éxito.",
    "El cielo arriba, el lago abajo: la imagen del pisar. Así el hombre superior discrimina entre lo alto y lo bajo y afirma así la voluntad del pueblo.",
    "Situación delicada que requiere conducta correcta y cortesía. Puedes caminar entre peligros si te comportas con propiedad y respeto. La modestia te protege."
  ),
  11: hex(11, "La Paz", "泰", "Tài",
    "Lo pequeño se va, lo grande viene. Buena fortuna. Éxito.",
    "Cielo y tierra se unen: la imagen de la paz. Así el gobernante divide y completa el curso del cielo y la tierra, y ayuda al pueblo.",
    "Armonía entre cielo y tierra, entre lo creativo y lo receptivo. Momento de prosperidad y florecimiento. Aprovecha este tiempo favorable para avanzar."
  ),
  12: hex(12, "El Estancamiento", "否", "Pǐ",
    "El estancamiento. Personas indignas no favorecen la perseverancia del hombre superior. Lo grande se va, lo pequeño viene.",
    "Cielo y tierra no se unen: la imagen del estancamiento. Así el hombre superior se retira a su valor interior para escapar de las dificultades.",
    "Tiempo de bloqueo y separación. Las fuerzas creativas no fluyen. Retírate a tu interior, conserva tus valores y espera. No es tiempo de emprender."
  ),
  13: hex(13, "La Comunidad con los Hombres", "同人", "Tóng Rén",
    "Comunidad con los hombres en lo abierto. Éxito. Es propicio cruzar las grandes aguas. Es propicia la perseverancia del hombre superior.",
    "Cielo junto con fuego: la imagen de la comunidad. Así el hombre superior organiza los clanes y distingue las cosas.",
    "Unión entre personas basada en principios universales, no en intereses privados. Busca alianzas abiertas y transparentes. La comunidad verdadera trasciende las diferencias."
  ),
  14: hex(14, "La Gran Posesión", "大有", "Dà Yǒu",
    "La gran posesión. Éxito supremo.",
    "El fuego en lo alto del cielo: la imagen de la gran posesión. Así el hombre superior reprime el mal y promueve el bien, obedeciendo la voluntad benevolente del cielo.",
    "Abundancia y riqueza material o espiritual. Úsala con generosidad y sabiduría. El éxito viene de alinear tu poder con el bien común."
  ),
  15: hex(15, "La Modestia", "謙", "Qiān",
    "La modestia crea el éxito. El hombre superior lleva las cosas a su término.",
    "En medio de la tierra hay una montaña: la imagen de la modestia. Así el hombre superior reduce lo que está en exceso y aumenta lo que está en falta. Sopesa las cosas y las iguala.",
    "La modestia genuina es la virtud que nunca falla. Las montañas ocultas bajo la tierra. Quien se rebaja será elevado. Equilibra, no ostentes."
  ),
  16: hex(16, "El Entusiasmo", "豫", "Yù",
    "El entusiasmo. Es propicio designar ayudantes y poner ejércitos en marcha.",
    "El trueno sale retumbando de la tierra: la imagen del entusiasmo. Así los antiguos reyes hacían música para honrar la virtud y la ofrecían al Ser Supremo.",
    "Energía desbordante y alegría compartida. Buen momento para movilizar a otros e inspirar acción colectiva. La música y la celebración elevan el espíritu."
  ),
  17: hex(17, "El Seguimiento", "隨", "Suí",
    "El seguimiento tiene éxito supremo. La perseverancia es propicia. Sin culpa.",
    "El trueno en medio del lago: la imagen del seguimiento. Así el hombre superior al atardecer se recoge para su reposo y renovación.",
    "Adaptarse al flujo del momento sin perder la integridad. Saber cuándo liderar y cuándo seguir. El descanso adecuado precede a la acción correcta."
  ),
  18: hex(18, "La Corrupción", "蠱", "Gǔ",
    "La corrupción. Éxito supremo. Es propicio cruzar las grandes aguas. Antes del punto de partida, tres días. Después del punto de partida, tres días.",
    "El viento sopla bajo la montaña: la imagen de la corrupción. Así el hombre superior agita al pueblo y fortalece su espíritu.",
    "Lo que se ha estropeado debe repararse. Hay trabajo por hacer para corregir errores del pasado. Planifica cuidadosamente antes y después de actuar."
  ),
  19: hex(19, "El Acercamiento", "臨", "Lín",
    "El acercamiento tiene éxito supremo. La perseverancia es propicia. Cuando llegue el octavo mes habrá desventura.",
    "El lago sobre la tierra: la imagen del acercamiento. Así el hombre superior es inagotable en su voluntad de enseñar e ilimitado en su tolerancia y protección del pueblo.",
    "Tiempo favorable de acercamiento y crecimiento. Pero sé consciente de que todo ciclo tiene su declive. Aprovecha el momento con sabiduría."
  ),
  20: hex(20, "La Contemplación", "觀", "Guān",
    "La contemplación. Se ha completado la ablución pero aún no la ofrenda. Llena de confianza, levanta la mirada.",
    "El viento sopla sobre la tierra: la imagen de la contemplación. Así los antiguos reyes visitaban las regiones del mundo, contemplaban al pueblo y daban instrucción.",
    "Momento de observar desde lo alto con perspectiva amplia. No actúes todavía; contempla, reflexiona y comprende primero. Tu ejemplo inspira más que tus palabras."
  ),
  21: hex(21, "La Mordedura Tajante", "噬嗑", "Shì Hè",
    "La mordedura tajante tiene éxito. Es propicio administrar justicia.",
    "Trueno y rayo: la imagen de la mordedura tajante. Así los antiguos reyes imponían penas firmes y aplicaban las leyes.",
    "Hay un obstáculo que debe eliminarse con acción decisiva. La justicia firme pero justa es necesaria. No evites enfrentar lo que debe resolverse."
  ),
  22: hex(22, "La Gracia", "賁", "Bì",
    "La gracia tiene éxito. En lo pequeño es propicio emprender algo.",
    "El fuego al pie de la montaña: la imagen de la gracia. Así el hombre superior procede cuando aclara los asuntos corrientes, pero no se atreve a decidir controversias de este modo.",
    "La belleza y la forma exterior tienen su lugar, pero no deben confundirse con la sustancia. Cuida la presentación en asuntos menores. Para lo grande, mira más allá de la apariencia."
  ),
  23: hex(23, "El Desmoronamiento", "剝", "Bō",
    "El desmoronamiento. No es propicio ir a ningún sitio.",
    "La montaña descansa sobre la tierra: la imagen del desmoronamiento. Así los que están arriba solo pueden asegurar su posición siendo generosos con los de abajo.",
    "Tiempo de deterioro y pérdida. Lo que era sólido se desmorona. No emprendas nada nuevo ahora. Sé generoso y espera a que el ciclo cambie."
  ),
  24: hex(24, "El Retorno", "復", "Fù",
    "El retorno. Éxito. Salir y entrar sin error. Amigos llegan sin culpa. El camino va y viene. Al séptimo día llega el retorno. Es propicio tener adónde ir.",
    "El trueno dentro de la tierra: la imagen del retorno. Así los antiguos reyes cerraban los pasos en la época del solsticio. Los mercaderes y viajeros no iban a ninguna parte.",
    "Después del punto más oscuro, la luz retorna. Es un nuevo comienzo natural después de un período de reposo o crisis. El momento del cambio ha llegado."
  ),
  25: hex(25, "La Inocencia", "無妄", "Wú Wàng",
    "La inocencia. Éxito supremo. La perseverancia es propicia. Si alguien no es recto, tendrá desventura, y no es propicio emprender nada.",
    "Bajo el cielo rueda el trueno. Todas las cosas alcanzan su estado natural de inocencia. Así los antiguos reyes, ricos en virtud y en armonía con el tiempo, fomentaban y nutrieban todos los seres.",
    "Actúa desde la autenticidad y la espontaneidad natural. Lo inesperado sucede; acéptalo sin artificio. Solo la sinceridad genuina lleva al éxito."
  ),
  26: hex(26, "El Gran Acumulador", "大畜", "Dà Xù",
    "El poder de lo grande que domestica. La perseverancia es propicia. No comer en casa trae buena fortuna. Es propicio cruzar las grandes aguas.",
    "El cielo en medio de la montaña: la imagen del gran acumulador. Así el hombre superior se familiariza con muchos dichos de la antigüedad y muchos hechos del pasado, para fortalecer así su carácter.",
    "Gran acumulación de fuerza, sabiduría o recursos. Es tiempo de estudiar, prepararse y reunir energía antes de la gran empresa. Sal de tu zona de confort."
  ),
  27: hex(27, "El Nutrirse", "頤", "Yí",
    "El nutrirse. Perseverancia trae buena fortuna. Presta atención al alimento y a aquello con que una persona trata de llenar su boca.",
    "Al pie de la montaña está el trueno: la imagen del nutrirse. Así el hombre superior es cuidadoso con sus palabras y moderado en comer y beber.",
    "Cuida lo que nutres: tanto tu cuerpo como tu mente. Observa qué consumes y qué alimentas en otros. La templanza en palabras y alimentos trae salud."
  ),
  28: hex(28, "El Exceso", "大過", "Dà Guò",
    "La viga maestra se comba hasta el punto de quiebre. Es propicio tener adónde ir. Éxito.",
    "El lago se eleva por encima de los árboles: la imagen del exceso. Así el hombre superior, cuando está solo, no se preocupa, y si debe renunciar al mundo, no se entristece.",
    "Situación de presión extrema: algo está a punto de ceder. Se necesita acción extraordinaria. Mantén la calma interior incluso cuando todo parece excesivo."
  ),
  29: hex(29, "El Abismo", "坎", "Kǎn",
    "El abismo repetido. Si eres sincero, tendrás éxito en tu corazón, y lo que hagas tendrá éxito.",
    "El agua fluye sin detenerse y llega a su meta: la imagen del abismo repetido. Así el hombre superior camina en virtud constante y se ejercita en la enseñanza.",
    "Peligro sobre peligro. Pero el agua siempre encuentra su camino. Sé constante como el agua: fluye, no te detengas ante los obstáculos. La sinceridad interior te guía."
  ),
  30: hex(30, "El Fuego", "離", "Lí",
    "Lo que se adhiere. La perseverancia es propicia y trae éxito. Cuidar la vaca trae buena fortuna.",
    "La claridad se eleva dos veces: la imagen del fuego. Así el gran hombre, perpetuando esta claridad, ilumina las cuatro regiones del mundo.",
    "Claridad, iluminación y dependencia. El fuego necesita algo a qué adherirse. Busca aquello que es digno de tu devoción. La docilidad y la constancia te dan brillo."
  ),
  31: hex(31, "La Influencia", "咸", "Xián",
    "La influencia. Éxito. La perseverancia es propicia. Tomar una doncella trae buena fortuna.",
    "Sobre la montaña hay un lago: la imagen de la influencia. Así el hombre superior anima a la gente a acercarse aceptándola con receptividad.",
    "Atracción mutua y receptividad. Deja que tu corazón se abra para influir y ser influido. Las relaciones florecen cuando hay humildad y apertura genuina."
  ),
  32: hex(32, "La Duración", "恆", "Héng",
    "La duración. Éxito. Sin culpa. La perseverancia es propicia. Es propicio tener adónde ir.",
    "Trueno y viento: la imagen de la duración. Así el hombre superior permanece firme y no cambia de dirección.",
    "Lo que perdura no es lo rígido sino lo que se renueva constantemente dentro de su naturaleza. Mantén tu rumbo con constancia. El matrimonio entre trueno y viento."
  ),
  33: hex(33, "La Retirada", "遯", "Dùn",
    "La retirada. Éxito. En lo pequeño, la perseverancia es propicia.",
    "Bajo el cielo está la montaña: la imagen de la retirada. Así el hombre superior mantiene al vulgar a distancia, no con enojo sino con mesura.",
    "Retirarse a tiempo es señal de sabiduría, no de cobardía. Las fuerzas oscuras avanzan; cede el terreno con dignidad. Preserva tu fuerza para mejor momento."
  ),
  34: hex(34, "El Gran Poder", "大壯", "Dà Zhuàng",
    "El poder de lo grande. La perseverancia es propicia.",
    "El trueno en lo alto del cielo: la imagen del poder de lo grande. Así el hombre superior no pisa senderos que no estén de acuerdo con el orden establecido.",
    "Gran fuerza y energía disponibles. Pero el poder debe usarse correctamente, nunca de forma arbitraria. Sé poderoso pero justo; la fuerza sin rectitud destruye."
  ),
  35: hex(35, "El Progreso", "晉", "Jìn",
    "El progreso. El poderoso príncipe es honrado con caballos en gran número. En un solo día es recibido en audiencia tres veces.",
    "El sol se eleva sobre la tierra: la imagen del progreso. Así el hombre superior ilumina por sí mismo sus brillantes cualidades.",
    "Avance claro y visible, como el sol que sale. Tus virtudes son reconocidas. Sé como la luz: brilla por ti mismo sin arrogancia. El progreso viene naturalmente."
  ),
  36: hex(36, "El Oscurecimiento de la Luz", "明夷", "Míng Yí",
    "El oscurecimiento de la luz. En la adversidad es propicio ser perseverante.",
    "La luz se ha sumergido en la tierra: la imagen del oscurecimiento de la luz. Así el hombre superior vive con la gran masa. Vela su brillo y sin embargo sigue brillando.",
    "La luz está oculta bajo la tierra. Tiempo de adversidad donde debes ocultar tu brillo para sobrevivir. Mantén tu llama interior viva pero no la expongas."
  ),
  37: hex(37, "La Familia", "家人", "Jiā Rén",
    "La familia. La perseverancia de la mujer es propicia.",
    "El viento sale del fuego: la imagen de la familia. Así el hombre superior tiene sustancia en sus palabras y duración en su modo de vivir.",
    "El orden correcto comienza en casa. Cada miembro tiene su rol y responsabilidad. Las palabras deben tener sustancia y las acciones consistencia."
  ),
  38: hex(38, "La Oposición", "睽", "Kuí",
    "La oposición. En asuntos pequeños, buena fortuna.",
    "Fuego arriba y lago abajo: la imagen de la oposición. Así el hombre superior retiene su individualidad en medio de la comunidad.",
    "Hay tensiones y diferencias de opinión. No intentes forzar la unión; mejor acepta las diferencias y trabaja en lo pequeño. La diversidad puede ser fecunda."
  ),
  39: hex(39, "El Obstáculo", "蹇", "Jiǎn",
    "El obstáculo. El sudoeste es propicio. El nordeste no es propicio. Es propicio ver al gran hombre. La perseverancia trae buena fortuna.",
    "Agua sobre la montaña: la imagen del obstáculo. Así el hombre superior se vuelve sobre sí mismo y cultiva su virtud.",
    "Hay obstáculos serios en el camino. No avances de frente; busca rodeos y aliados. El obstáculo exterior es una invitación a cultivarte interiormente."
  ),
  40: hex(40, "La Liberación", "解", "Xiè",
    "La liberación. El sudoeste es propicio. Si ya no queda nada adónde ir, el retorno trae buena fortuna. Si aún hay algo adónde ir, la prontitud trae buena fortuna.",
    "El trueno y la lluvia aparecen: la imagen de la liberación. Así el hombre superior perdona errores y trata con indulgencia las transgresiones.",
    "La tensión se libera como la tormenta que limpia el aire. Perdona, libera lo pendiente y actúa sin demora. Es tiempo de resolver y pasar a la acción rápidamente."
  ),
  41: hex(41, "La Pérdida", "損", "Sǔn",
    "La pérdida. Si eres sincero, habrá éxito supremo sin culpa. Uno puede perseverar en esto. Es propicio emprender algo. ¿Cómo se pone esto en práctica? Pueden usarse dos pequeñas escudillas para el sacrificio.",
    "Al pie de la montaña está el lago: la imagen de la pérdida. Así el hombre superior controla su ira y refrena sus instintos.",
    "Disminuir lo inferior para nutrir lo superior. A veces la pérdida material es ganancia espiritual. Sacrifica lo superficial para fortalecer lo esencial."
  ),
  42: hex(42, "La Ganancia", "益", "Yì",
    "La ganancia. Es propicio emprender algo. Es propicio cruzar las grandes aguas.",
    "Viento y trueno: la imagen de la ganancia. Así el hombre superior, cuando ve el bien, lo imita; si tiene defectos, se deshace de ellos.",
    "Tiempo de crecimiento y beneficio. Lo de arriba desciende para nutrir lo de abajo. Emprende con confianza; imita lo bueno que ves y corrige tus faltas."
  ),
  43: hex(43, "La Resolución", "夬", "Guài",
    "La resolución. Debe hacerse conocer con determinación en la corte del rey. Debe proclamarse con veracidad. ¡Peligro! Es necesario notificar a la propia ciudad. No es propicio recurrir a las armas. Es propicio emprender algo.",
    "El lago se eleva hasta el cielo: la imagen de la resolución. Así el hombre superior dispensa riqueza hacia abajo y se abstiene de descansar en su virtud.",
    "El momento de la determinación firme. Lo oscuro debe eliminarse con resolución pero sin violencia. Sé transparente, decidido y generoso. La verdad es tu arma."
  ),
  44: hex(44, "El Encuentro", "姤", "Gòu",
    "El encuentro. La doncella es poderosa. No debe uno casarse con tal doncella.",
    "Bajo el cielo está el viento: la imagen del encuentro. Así el príncipe emite sus órdenes y las proclama a las cuatro regiones del mundo.",
    "Un encuentro inesperado con algo o alguien tentador pero potencialmente peligroso. Ten cautela ante lo que se presenta seductor. No te comprometas demasiado rápido."
  ),
  45: hex(45, "La Reunión", "萃", "Cuì",
    "La reunión. Éxito. El rey se acerca a su templo. Es propicio ver al gran hombre. Éxito. La perseverancia es propicia. Ofrendar grandes sacrificios trae buena fortuna. Es propicio emprender algo.",
    "El lago sobre la tierra: la imagen de la reunión. Así el hombre superior renueva sus armas para enfrentar lo imprevisto.",
    "Es tiempo de reunión y congregación. Pero toda reunión necesita un centro espiritual o moral que la sostenga. Prepárate también para los riesgos de la acumulación."
  ),
  46: hex(46, "El Ascenso", "升", "Shēng",
    "El ascenso tiene éxito supremo. Uno debe ver al gran hombre. ¡No temas! La partida hacia el sur trae buena fortuna.",
    "En medio de la tierra crece la madera: la imagen del ascenso. Así el hombre superior, siendo devoto, acumula pequeñas cosas para lograr algo alto y grande.",
    "Crecimiento gradual y sostenido, como un árbol que crece desde la tierra. Avanza con esfuerzo constante y humilde. Busca consejo y no temas al progreso."
  ),
  47: hex(47, "El Agotamiento", "困", "Kùn",
    "El agotamiento. Éxito. Perseverancia. El gran hombre trae buena fortuna. Sin culpa. Cuando uno tiene algo que decir, no se le cree.",
    "No hay agua en el lago: la imagen del agotamiento. Así el hombre superior arriesga su vida para seguir su voluntad.",
    "Recursos agotados, sin reconocimiento. Pero incluso en la adversidad extrema, la entereza interior puede prevalecer. Las palabras no sirven ahora; solo los hechos."
  ),
  48: hex(48, "El Pozo de Agua", "井", "Jǐng",
    "El pozo. Se puede cambiar la ciudad pero no se puede cambiar el pozo. No disminuye ni aumenta. Van y vienen y sacan del pozo. Si casi se ha alcanzado el agua pero la cuerda no llega, o si se rompe el cántaro, eso trae desventura.",
    "Agua sobre la madera: la imagen del pozo. Así el hombre superior alienta al pueblo en su trabajo y lo exhorta a ayudarse mutuamente.",
    "La fuente inagotable de sabiduría y nutrición espiritual. Asegúrate de completar lo que empiezas. No basta con acercarse al agua; debes poder sacarla."
  ),
  49: hex(49, "La Revolución", "革", "Gé",
    "La revolución. En tu propio día serás creído. Éxito supremo. La perseverancia es propicia. El remordimiento desaparece.",
    "Fuego en el lago: la imagen de la revolución. Así el hombre superior ordena el calendario y aclara las estaciones.",
    "Cambio radical y necesario. Pero solo es legítimo cuando llega en su momento justo y es aceptado por todos. Primero convence, luego transforma."
  ),
  50: hex(50, "El Caldero", "鼎", "Dǐng",
    "El caldero. Éxito supremo. Buena fortuna.",
    "Sobre la madera hay fuego: la imagen del caldero. Así el hombre superior consolida su destino haciendo correcta su posición.",
    "El caldero sagrado que transforma lo crudo en alimento para el espíritu. Simboliza la cultura, la civilización y la transformación espiritual. Gran fortuna."
  ),
  51: hex(51, "El Trueno", "震", "Zhèn",
    "El trueno. Éxito. El trueno llega: ¡oh, oh! Palabras de risa: ¡ja, ja! El trueno aterroriza a cien millas y él no deja caer la cuchara ceremonial ni el cáliz.",
    "Trueno repetido: la imagen de la conmoción. Así el hombre superior, con temor y temblor, pone su vida en orden y examina su conducta.",
    "Conmoción repentina que asusta pero despierta. Después del susto viene la risa del alivio. Usa el impacto para examinar tu vida y poner orden interior."
  ),
  52: hex(52, "La Montaña", "艮", "Gèn",
    "Mantener quieta la espalda de modo que ya no se sienta el cuerpo. Ir al patio y no ver a la gente. Sin culpa.",
    "Montañas una junto a otra: la imagen de la quietud. Así el hombre superior no permite que sus pensamientos vayan más allá de su situación.",
    "Quietud y meditación. Sabe cuándo detenerte. No dejes que la mente corra más allá de lo que el momento requiere. La quietud es fuerza."
  ),
  53: hex(53, "El Desarrollo Gradual", "漸", "Jiàn",
    "El desarrollo gradual. La doncella es dada en matrimonio. Buena fortuna. La perseverancia es propicia.",
    "Sobre la montaña hay un árbol: la imagen del desarrollo gradual. Así el hombre superior permanece en dignidad y virtud para mejorar las costumbres.",
    "Progreso lento, natural y ordenado, como un árbol que crece en la montaña. Cada paso debe ser correcto. No te apresures; el desarrollo orgánico trae los mejores frutos."
  ),
  54: hex(54, "El Matrimonio de la Doncella", "歸妹", "Guī Mèi",
    "El matrimonio de la doncella. Emprender algo trae desventura. Nada que sea propicio.",
    "Sobre el lago hay trueno: la imagen del matrimonio de la doncella. Así el hombre superior comprende lo transitorio a la luz de la eternidad del fin.",
    "Situación donde se actúa por impulso o se acepta una posición subordinada. No es momento de emprender por cuenta propia. Comprende el juego de lo temporal y lo eterno."
  ),
  55: hex(55, "La Abundancia", "豐", "Fēng",
    "La abundancia tiene éxito. El rey la alcanza. No estés triste. Sé como el sol al mediodía.",
    "Trueno y rayo llegan ambos: la imagen de la abundancia. Así el hombre superior decide los litigios y ejecuta las penas.",
    "Plenitud máxima, como el sol en su cenit. Pero recuerda: después del mediodía el sol desciende. Disfruta y actúa con decisión ahora, sin tristeza por lo transitorio."
  ),
  56: hex(56, "El Viajero", "旅", "Lǚ",
    "El viajero. Éxito a través de lo pequeño. La perseverancia del viajero trae buena fortuna.",
    "El fuego sobre la montaña: la imagen del viajero. Así el hombre superior es claro y cauteloso al imponer penas, y no arrastra litigios.",
    "Estás de paso, no te aferres. El viajero no tiene raíces fijas; debe ser prudente, adaptable y no provocar conflictos. Actúa en lo pequeño y sigue adelante."
  ),
  57: hex(57, "El Viento", "巽", "Xùn",
    "Lo suave. Éxito a través de lo pequeño. Es propicio tener adónde ir. Es propicio ver al gran hombre.",
    "Vientos que se siguen: la imagen de lo penetrante. Así el hombre superior difunde sus mandatos y lleva a cabo sus empresas.",
    "Influencia suave pero persistente, como el viento que penetra por todas partes. La constancia sutil logra más que la fuerza. Sé como el viento: flexible pero continuo."
  ),
  58: hex(58, "El Lago", "兌", "Duì",
    "Lo sereno. Éxito. La perseverancia es propicia.",
    "Lagos unidos: la imagen de lo sereno. Así el hombre superior se une a sus amigos para deliberar y practicar.",
    "Alegría y serenidad genuinas, compartidas con otros. La verdadera alegría viene del intercambio y la amistad. Practica junto a otros y cultiva la comunicación gozosa."
  ),
  59: hex(59, "La Dispersión", "涣", "Huàn",
    "La dispersión. Éxito. El rey se acerca a su templo. Es propicio cruzar las grandes aguas. La perseverancia es propicia.",
    "El viento sopla sobre el agua: la imagen de la dispersión. Así los antiguos reyes ofrecían sacrificios al Señor e instituían templos.",
    "Lo rígido se disuelve; los bloqueos se dispersan. Usa el viento de la inspiración para disolver el egoísmo y la separación. Un centro espiritual reunifica lo disperso."
  ),
  60: hex(60, "La Moderación", "節", "Jié",
    "La moderación. Éxito. La moderación amarga no debe practicarse con perseverancia.",
    "Agua sobre el lago: la imagen de la moderación. Así el hombre superior crea el número y la medida, y examina la naturaleza de la virtud y la conducta correcta.",
    "Los límites son necesarios, como las orillas de un lago. Pero no excedas la moderación hasta volverla amarga. Encuentra el punto justo entre el exceso y la restricción."
  ),
  61: hex(61, "La Verdad Interior", "中孚", "Zhōng Fú",
    "La verdad interior. Cerdos y peces. Buena fortuna. Es propicio cruzar las grandes aguas. La perseverancia es propicia.",
    "Viento sobre el lago: la imagen de la verdad interior. Así el hombre superior delibera sobre las penas y demora las ejecuciones.",
    "Sinceridad y confianza que llegan hasta los seres más humildes. Tu verdad interior puede mover incluso lo que parece imposible. La confianza genuina abre todos los caminos."
  ),
  62: hex(62, "El Pequeño Exceso", "小過", "Xiǎo Guò",
    "El pequeño exceso. Éxito. La perseverancia es propicia. Se pueden hacer cosas pequeñas, no se deben hacer cosas grandes. El pájaro volador trae el mensaje: no es bueno esforzarse hacia arriba, es bueno quedarse abajo. Gran buena fortuna.",
    "El trueno sobre la montaña: la imagen del pequeño exceso. Así el hombre superior, en su conducta, da preponderancia a la reverencia; en el duelo, da preponderancia a la pena; en sus gastos, da preponderancia a la frugalidad.",
    "Pequeño exceso en lo correcto es aceptable. No aspires demasiado alto; mejor excede en humildad y modestia. El pájaro que vuela demasiado alto cae; quédate cerca de la tierra."
  ),
  63: hex(63, "La Conclusión", "既濟", "Jì Jì",
    "La conclusión. Éxito en lo pequeño. La perseverancia es propicia. Al principio buena fortuna, al final desorden.",
    "Agua sobre fuego: la imagen de la conclusión. Así el hombre superior reflexiona sobre la desgracia y se prepara de antemano contra ella.",
    "Todo está en su lugar, el orden es perfecto. Pero justamente cuando todo parece completo comienza el deterioro. Mantén la vigilancia; el final de un ciclo es inicio de otro."
  ),
  64: hex(64, "La Inconclusión", "未濟", "Wèi Jì",
    "La inconclusión. Éxito. Pero si el pequeño zorro casi ha terminado de cruzar y moja su cola, no hay nada que sea propicio.",
    "El fuego sobre el agua: la imagen de lo incompleto. Así el hombre superior es cauteloso en la diferenciación de las cosas, para que cada una llegue a su lugar.",
    "Todo está aún por completarse. El orden final aún no se ha alcanzado. Sé cauteloso y discrimina bien. No te apresures al final del recorrido; un paso en falso arruina todo el esfuerzo."
  ),
};
