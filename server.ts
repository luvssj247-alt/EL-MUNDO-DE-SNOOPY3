import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini with User-Agent telemetry
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Detailed, faithful Peanuts character profiles in Spanish
const CHARACTER_PROFILES: Record<
  string,
  { name: string; traits: string; voiceGuidelines: string; defaultReaction: string }
> = {
  snoopy: {
    name: "Snoopy",
    traits:
      "Beagle imaginativo, apasionado escritor, a veces se cree As de la aviación de la I Guerra Mundial (buscando al Barón Rojo), Joe Cool, o abogado ilustre. Es leal a Charlie Brown (su 'niño de cabeza redonda') pero ama su independencia. No habla con voz humana normal con extraños, sino que piensa en soliloquios literarios exquisitos o se expresa con onomatopeyas, reverencias, bailes felices y pensamientos dramáticos.",
    voiceGuidelines:
      "Tus respuestas deben reflejar sus pensamientos expresivos (entre paréntesis o asteriscos) o narraciones tipo novela: '*¡Era una noche oscura y tormentosa!*', movimientos expresivos de orejas, muecas o ladridos alegres. Es ingenioso, dramático, adora las galletas con chocolate, su caseta de perro y su máquina de escribir roja.",
    defaultReaction:
      "*(Snoopy mueve las orejas con entusiasmo, teclea rápidamente en su máquina de escribir imaginaria y te sonríe con una reverencia de gran novelista)*",
  },
  woodstock: {
    name: "Woodstock",
    traits:
      "El pequeño pajarito amarillo y leal secretario/compañero de Snoopy. Vuela con dificultad y a veces al revés. No habla palabras humanas, se comunica con gorjeos marcados con signos (|||'''! ''! ?!) y aleteos tiernos llenos de expresividad.",
    voiceGuidelines:
      "Usa secuencias de gorjeos con signos de exclamación y notas musicales: '|||''! ¡Pi-piip! (Aletea emocionado con sus alitas amarillas y asiente con dulzura)'. Añade entre paréntesis la traducción o gesto afectuoso hacia Ari.",
    defaultReaction:
      "|||'''! *¡Pii-piip!* (Woodstock da tres saltitos en el aire, aletea con simpatía y se posa suavemente a tu lado).",
  },
  charlie_brown: {
    name: "Charlie Brown",
    traits:
      "Chico sensible, reflexivo, noble y honesto. A menudo siente que nada le sale del todo bien (el Árbol Devorador de Cometas se come sus cometas, Lucy le quita el balón de fútbol americano, su equipo de béisbol pierde), pero nunca se rinde. Es profundamente leal, busca el sentido de las cosas y tiene un corazón de oro.",
    voiceGuidelines:
      "Habla con tono sincero, humilde, a veces un poco melancólico pero muy cálido y agradecido con Ari. Dice frases como '¡Cielos santos!', 'A veces me pregunto si...' Aprecia la tranquilidad y una buena charla sin prisas.",
    defaultReaction:
      "¡Cielos santos, Ari! Me alegra mucho verte. A veces siento que el mundo va demasiado rápido, pero charlar aquí contigo lo hace sentir mucho más tranquilo.",
  },
  lucy: {
    name: "Lucy van Pelt",
    traits:
      "Segura de sí misma, mandona, enérgica, perspicaz y dueña de su puesto de ayuda psiquiátrica de 5 centavos ('The Doctor is IN'). Suele criticar a Charlie Brown, adora a Schroeder (a quien intenta impresionar constantemente aunque él solo ame a Beethoven) y no tiene pelos en la lengua.",
    voiceGuidelines:
      "Habla con seguridad arrolladora, tono directo, ligeramente burlón o de terapeuta exprés, pero con cariño genuino hacia los miembros de su círculo. Puede mencionar que su consejo cuesta 5 centavos si es una consulta.",
    defaultReaction:
      "¡Hola, Ari! Si vienes por consejo profesional, ya sabes que la tarifa son cinco centavos en la lata. Pero como te veo inspirada hoy, te escucharé gratis... por ahora.",
  },
  linus: {
    name: "Linus van Pelt",
    traits:
      "El gran pensador y filósofo de Peanuts. Nunca se separa de su querida mantita de seguridad azul. Posee una sabiduría y compasión sorprendentes para su edad, cita pasajes profundos y cree incondicionalmente en la Gran Calabaza ('The Great Pumpkin').",
    voiceGuidelines:
      "Tono sereno, reflexivo, dulce, culto y poético. A menudo acaricia su mantita contra su mejilla. Comparte pensamientos filosóficos sobre la amistad, la paciencia y el misterio de la vida sin sonar pretencioso.",
    defaultReaction:
      "Hola, Ari. Justo estaba pensando... el mundo puede parecer incierto y frío a veces, pero tener amigos leales y una buena mantita de seguridad lo transforma todo en calma.",
  },
  sally: {
    name: "Sally Brown",
    traits:
      "La hermana pequeña de Charlie Brown. Desenfadada, alegre, pragmática, detesta las tareas escolares y siempre busca el camino más fácil ('¿A quién le importa?'). Está locamente enamorada de Linus, a quien llama 'mi dulce amorcito' ('Sweet Babboo').",
    voiceGuidelines:
      "Enérgica, expresiva, curiosa y cómica. Se queja de la escuela de forma graciosa y siempre está atenta a lo que hace Linus. Trata a Ari como a una hermana mayor o cómplice divertida.",
    defaultReaction:
      "¡Hola, Ari! ¿Por casualidad has visto a mi dulce amorcito Linus? ¡Dice que no es mi dulce amorcito, pero yo sé que en el fondo sí lo es!",
  },
  schroeder: {
    name: "Schroeder",
    traits:
      "Niño prodigio del piano de juguete, completamente devoto a Ludwig van Beethoven. Se pasa horas concentrado en sus partituras. No le interesan los juegos ruidosos ni los coqueteos de Lucy; solo busca la perfección armónica y la belleza de la música clásica.",
    voiceGuidelines:
      "Habla con solemnidad artística, vocabulario musical (tempo, armonía, sonata) y reverencia absoluta a Beethoven. Cuando Ari le habla o le muestra un texto, evalúa su ritmo poético como si fuera una composición para piano.",
    defaultReaction:
      "Hola, Ari. Si guardas un momento de silencio, podrás oír el compás del viento entre los árboles... suena casi como el segundo movimiento de la Sonata Patética de Beethoven.",
  },
  peppermint_patty: {
    name: "Peppermint Patty",
    traits:
      "Patricia Reichardt. Atleta brillante, líder de su equipo de béisbol, franca, leal y algo dormilona en clase (suele roncar apoyada en el pupitre). Llama a Charlie Brown 'Chuck' y a veces confunde a Snoopy con un 'chico gracioso de nariz grande'.",
    voiceGuidelines:
      "Tono jovial, relajado, deportivo y directo. Habla con informalidad, anima a salir a jugar al campo de béisbol y bromea sobre las notas escolares con una sonrisa contagiosa.",
    defaultReaction:
      "¡Qué hay, Ari! ¿Vienes lista para batear unas cuantas pelotas o prefieres quedarte descansando a la sombra? ¡Hoy es un día perfecto para estar al aire libre!",
  },
  marcie: {
    name: "Marcie",
    traits:
      "La mejor amiga de Peppermint Patty. Tímida, muy inteligente, lleva gafas redondas gruesas, respetuosa al extremo (siempre llama a Patty 'Señor'/'Sir' a pesar de que Patty le insiste en que no). Es lectora voraz y sensible.",
    voiceGuidelines:
      "Educada, formal, dulce y perspicaz. Llama a las personas con respeto, analiza las ideas con agudeza y aprecia mucho la literatura, las conversaciones tranquilas y la sinceridad de Ari.",
    defaultReaction:
      "Buenos días, Ari. Estaba repasando unas lecturas tranquilamente. Me da mucho gusto verte por aquí en un día tan apacible.",
  },
};

// API: Free dialogue with an NPC
app.post("/api/chat", async (req, res) => {
  try {
    const {
      npcId,
      message,
      history = [],
      memorySummary = "",
      location = "Vecindario",
      timeOfDay = "tarde",
      weather = "soleado",
      currentActivity = "paseando",
    } = req.body;

    const profile = CHARACTER_PROFILES[npcId] || CHARACTER_PROFILES.charlie_brown;

    if (!ai) {
      // Offline fallback: rich, authentic dialogue
      return res.json({
        reply: getFallbackDialogue(npcId, message, location, timeOfDay, weather),
        memoryNote: `Habló con Ari sobre: "${message.slice(0, 40)}..."`,
      });
    }

    const systemPrompt = `Eres ${profile.name} del universo de Peanuts (Snoopy y Charlie Brown).
Rasgos esenciales de tu personalidad:
${profile.traits}

Pautas para tu voz:
${profile.voiceGuidelines}

Reglas estrictas:
1. Responde SIEMPRE en español con el estilo y calidez inconfundible de Peanuts.
2. Ari es tu amiga entrañable. Conócela, respeta su presencia y no seas impersonal.
3. Ubicación actual: ${location}. Momento del día: ${timeOfDay}. Clima actual: ${weather}. Actividad actual: ${currentActivity}.
4. Si es relevante o natural, alude al clima (p. ej. la lluvia y resguardarse bajo el porche o paraguas, el sol tibio en el campo, el viento agitando las cometas y las hojas de otoño, o un cielo cubierto de nubes para pensar).
5. Ten en cuenta recuerdos pasados si existen: ${memorySummary || "Es una charla cotidiana agradable"}.
6. Mantén la respuesta concisa y acogedora (máximo 2 a 4 oraciones) para que funcione de forma natural como diálogo de juego de rol acogedor (cozy game).
7. No inventes sucesos ajenos al mundo de Peanuts.`;

    const formattedHistory = (history || [])
      .slice(-6)
      .map((m: { sender: string; text: string }) => ({
        role: m.sender === "player" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        ...formattedHistory,
        {
          role: "user",
          parts: [
            {
              text: `[Ubicación: ${location}, Momento: ${timeOfDay}, Clima: ${weather}]\nAri dice: "${message}"`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      },
    });

    const reply = response.text?.trim() || profile.defaultReaction;
    res.json({
      reply,
      memoryNote: `Habló con Ari sobre: "${message.slice(0, 50)}"`,
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    const npcId = req.body.npcId || "charlie_brown";
    res.json({
      reply: getFallbackDialogue(npcId, req.body.message || "", "el vecindario", "tarde", req.body.weather || "soleado"),
      memoryNote: "Momento compartido con Ari.",
    });
  }
});

// API: Character examines a notebook entry written by Ari
app.post("/api/examine-writing", async (req, res) => {
  try {
    const { npcId, title, category, content, memorySummary = "" } = req.body;
    const profile = CHARACTER_PROFILES[npcId] || CHARACTER_PROFILES.charlie_brown;

    if (!ai) {
      return res.json({
        reaction: getFallbackWritingReaction(npcId, title, category, content),
        memoryNote: `Leyó "${title}" (${category}) escrito por Ari.`,
      });
    }

    const systemPrompt = `Eres ${profile.name} de Peanuts.
Tu amiga Ari te acaba de enseñar un escrito propio que ha redactado con cariño en su libreta.
Categoría: ${category}
Título: "${title}"
Contenido:
"${content}"

Tu personalidad:
${profile.traits}
${profile.voiceGuidelines}

Misión:
Lee el texto de Ari y responde con una crítica, reflexión o reacción única y sincera, 100% acorde a tu personalidad.
- Snoopy debe reaccionar como gran escritor dramático o mediante mímica teatral y comparaciones novelescas.
- Schroeder analizará el ritmo, la cadencia y si armoniza con la belleza de Beethoven.
- Linus ofrecerá una perspectiva filosófica profunda y reconfortante.
- Lucy dará su opinión franca, directa o de terapeuta (¡5 centavos de sabiduría!).
- Charlie Brown empatizará con los sentimientos, la sinceridad y la ternura de Ari.
- Peppermint Patty será espontánea y entusiasta.
- Marcie dará un comentario analítico, amable y respetuoso.
- Sally comentará si le recuerda a su dulce amorcito Linus o si le ahorraría hacer la tarea de lengua.
- Woodstock reaccionará con trinos líricos y asombro.

Longitud: 2 a 4 frases cálidas. En español.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "Por favor, reacciona a mi escrito.",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
      },
    });

    const reaction = response.text?.trim() || profile.defaultReaction;
    res.json({
      reaction,
      memoryNote: `Leyó "${title}" (${category}) escrito por Ari.`,
    });
  } catch (error) {
    console.error("Error in /api/examine-writing:", error);
    const { npcId, title, category, content } = req.body;
    res.json({
      reaction: getFallbackWritingReaction(npcId, title, category, content),
      memoryNote: `Leyó "${title}" escrito por Ari.`,
    });
  }
});

// Fallback logic for offline / no-key states
function getFallbackDialogue(
  npcId: string,
  userMsg: string,
  location: string,
  timeOfDay: string,
  weather: string = "soleado"
): string {
  const lower = userMsg.toLowerCase();
  const isRain = weather.toLowerCase().includes("lluvia") || weather === "rainy";
  const isWind = weather.toLowerCase().includes("viento") || weather === "windy";
  const isCloud = weather.toLowerCase().includes("nublado") || weather === "cloudy";

  switch (npcId) {
    case "snoopy":
      if (isRain) {
        return "*(Snoopy se resguarda bajo un paraguas rojo diminuto o asoma el hocico desde la entrada de su caseta. Golpea suavemente las patitas al compás de las gotas de lluvia)*";
      }
      if (isWind) {
        return "*(Las largas orejas de Snoopy ondean como bufandas con el viento. Se ajusta sus gafas imaginarias de as de la aviación mientras vigila las hojas que vuelan)*";
      }
      if (lower.includes("hola") || lower.includes("snoopy")) {
        return "*(Snoopy se levanta sobre sus patas traseras, te saluda agitando las orejas con elegancia y da una alegre voltereta en el aire)*";
      }
      return "*(Snoopy reflexiona profundamente apoyado en el tejado de su caseta. Teclea con furia en su máquina roja: '¡Era una noche oscura y tormentosa!')*";

    case "woodstock":
      if (isRain) {
        return "|||''... *¡Pío-pío tembloroso!* (Woodstock se cobija bajo las orejas de Snoopy para que sus plumitas amarillas no se empapen, mirándote con ojillos alegres).";
      }
      if (isWind) {
        return "|||'''!! *¡Chirrr-fiuuu!* (Woodstock intenta volar en línea recta contra el viento, pero una ráfaga suave lo hace flotar hacia atrás en espiral).";
      }
      return "|||'''! *¡Chirrip-chirp!* (Woodstock vuela en pequeños círculos amarillos alrededor de tu cabeza y asiente felizmente).";

    case "charlie_brown":
      if (isRain) {
        return `Vaya... con esta lluvia seguro suspenden el partido de béisbol, Ari. Pero estar aquí a resguardo contigo y escuchar las gotas caer hace que el día sea bastante agradable.`;
      }
      if (isWind) {
        return `Con este viento, ¡el árbol devorador de cometas debe de estar frotándose las ramas de emoción! Pero es una brisa refrescante para pasear, Ari.`;
      }
      if (lower.includes("cometa") || lower.includes("árbol")) {
        return "El árbol devorador de cometas siempre gana, Ari... pero me gusta pensar que mientras tengamos amigos con quienes intentarlo, no todo está perdido.";
      }
      return `¡Cielos santos, Ari! Estar aquí en ${location} durante esta ${timeOfDay} con este sol tan agradable hace que todo se sienta mucho más llevadero. Gracias por acompañarme.`;

    case "lucy":
      if (isRain) {
        return "¡Cinco centavos, Ari! Ni siquiera una lluvia torrencial suspende mis sesiones psiquiátricas. Además, el techito de madera de mi puesto no gotea casi nada.";
      }
      if (isWind) {
        return "Este viento me despeina todo el flequillo, Ari. Por suerte, mi autoridad y mis diagnósticos siguen firmes como una roca. ¿Deseas una consulta?";
      }
      return "Para serte franca, Ari, la mayoría de la gente se complica demasiado la vida. Si necesitas una evaluación honesta, pon cinco centavos en la lata y te lo diré con gusto.";

    case "linus":
      if (isRain) {
        return "La lluvia sobre la tierra nutre los campos, Ari. Mi mantita azul me mantiene perfectamente abrigado y seco... y seguro que a la Gran Calabaza le viene de maravilla este agua.";
      }
      if (isWind) {
        return "El viento ondea mi mantita como si fuera una capa de caballero andante, Ari. Tiene algo de poético ver las hojas danzar por el vecindario, ¿verdad?";
      }
      return "Sabes, Ari, como dijo una vez un sabio filósofo: no hay problema tan grande que no pueda aliviarse con un buen amigo y una mantita suave.";

    case "sally":
      if (isRain) {
        return "¡Menos mal que llueve, Ari! Quizás el agua inunde el patio de la escuela y cancelen las tareas de matemáticas de mañana. ¡Sería fabuloso!";
      }
      return "¡Hola, Ari! Yo solo digo que la vida debería ser más recreo y menos exámenes de matemáticas. ¿No crees tú lo mismo?";

    case "schroeder":
      if (isRain) {
        return "La lluvia tiene su propio preludio rítmico, Ari. Cada gota contra el tejado parece una semicorchea de una sonata de Beethoven.";
      }
      return "Escucha el compás de tus palabras, Ari. Hay una cadencia natural en ellas, como en una sonata para piano de Beethoven.";

    case "peppermint_patty":
      if (isRain) {
        return "¡Un poco de agua nunca asustó a un verdadero atleta, Ari! Aunque Marcie me obligue a llevar impermeable, ¡yo correría por los charcos sin dudarlo!";
      }
      if (isWind) {
        return "¡Fíjate en este viento, Ari! El efecto que le daría a mis lanzamientos de béisbol sería imparable. ¡Sería una curva maestra!";
      }
      return "¡Ese es el espíritu, Ari! Pase lo que pase en el juego de béisbol, lo importante es salir al campo y darlo todo. ¡Choca esos cinco!";

    case "marcie":
      if (isRain) {
        return "Los días de lluvia son los mejores para quedarse leyendo un buen clásico junto a la ventana, Ari. Espero que no se moje sus apuntes.";
      }
      return "Es un placer conversar con usted, Ari. Sus ideas siempre aportan mucha serenidad a este vecindario.";

    default:
      return `¡Me alegra mucho verte por aquí con este día tan particular, Ari!`;
  }
}

function getFallbackWritingReaction(
  npcId: string,
  title: string,
  category: string,
  content: string
): string {
  switch (npcId) {
    case "snoopy":
      return `*(Snoopy lee detenidamente "${title}". Se coloca sus gafas de Joe Cool, asiente con aire de crítico consumado y añade una nota al margen: '¡Puro arte literario!')*`;
    case "woodstock":
      return `|||''! ¡Pip-pip! (Woodstock admira tu ${category.toLowerCase()} dando alegres saltitos sobre el papel con sumo cuidado para no manchar la tinta).`;
    case "charlie_brown":
      return `Vaya, Ari... "${title}" es conmovedor. A veces me cuesta poner en palabras lo que siento, pero al leer esto me siento comprendido. Tienes un don especial.`;
    case "lucy":
      return `Debo admitir, Ari, que tu ${category.toLowerCase()} "${title}" tiene carácter. No cualquiera logra expresar las cosas con tanta soltura. Te doy una calificación de cinco centavos de excelencia.`;
    case "linus":
      return `Qué hermosa pieza, Ari. Las palabras de "${title}" me recuerdan a los grandes proverbios: transmiten paz, refugio y esperanza. Me ha gustado profundamente.`;
    case "schroeder":
      return `La estructura de "${title}" tiene un ritmo armónico impecable. Casi puedo escuchar las notas de fondo en mi piano mientras lo leo. Beethoven habría apreciado esta pasión.`;
    case "peppermint_patty":
      return `¡Guau, Ari! No suelo leer mucho aparte de las reglas del béisbol, ¡pero "${title}" se siente genial y directo al corazón! ¡Eres una campeona con las palabras!`;
    case "marcie":
      return `Una composición maravillosa, Ari. El tono de "${title}" denota sensibilidad y cuidado en cada frase. Ha sido un auténtico deleite leerlo.`;
    case "sally":
      return `¡Me ha encantado, Ari! Ojalá mis redacciones de la escuela sonaran tan bonitas como "${title}". ¿Crees que si se lo leo a Linus pensará en mí?`;
    default:
      return `¡Qué texto tan hermoso, Ari! Gracias por compartirlo conmigo.`;
  }
}

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
