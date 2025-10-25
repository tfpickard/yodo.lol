"use client";

import { useEffect, useState } from "react";
import { EnhancedPost, DesignTheme } from "@/lib/openai";
import { ThemeEngine } from "@/lib/theme-engine";
import Feed from "./Feed";
import { motion } from "framer-motion";

interface DynamicFeedProps {
  initialPosts: EnhancedPost[];
  initialTheme: DesignTheme;
}

export default function DynamicFeed({
  initialPosts,
  initialTheme,
}: DynamicFeedProps) {
  const [posts, setPosts] = useState<EnhancedPost[]>(initialPosts);
  const [theme, setTheme] = useState<DesignTheme>(initialTheme);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isThemeChanging, setIsThemeChanging] = useState(false);
  const [titleClass, setTitleClass] = useState("");
  const [currentTitle, setCurrentTitle] = useState("¥ØĐØ.ŁØŁ");
  const [currentSubtitle, setCurrentSubtitle] = useState(
    "AI-Powered Psychedelic Nightmare Feed",
  );

  // Occult, alchemical, astronomical symbols and obscure emojis for buttons
  const voidSymbols = [
    "🜏 ⛤ ☿ 🝚",
    "⛧ ☾ ♆ 🜨",
    "🜍 ⚛ ☄ ⸙",
    "☊ 🜔 ⛢ 🝝",
    "♇ ⚗ 🜃 ⸚",
    "🝱 ☌ 🜑 ⛥",
    "☋ 🜘 ♅ 🝢",
    "⚚ ☽ 🜦 ⸜",
  ];

  const chaosSymbols = [
    "🜂 ⚸ ☿ 🝛",
    "⛦ ♂ 🜓 ⸏",
    "🜎 ☄ ⚕ 🝞",
    "⛧ 🜕 ♃ ⸝",
    "☊ ⚛ 🜡 🝣",
    "🜄 ⛤ ☌ ⚜",
    "♄ 🜗 ⚹ 🝤",
    "⚡︎ 🜚 ☋ 🗲",
  ];

  const warpSymbols = [
    "🜁 ⛥ ♀ 🝜",
    "☽ 🜒 ⚝ ⸎",
    "🜏 ♆ ⚞ 🝥",
    "⛢ 🜖 ☿ ⚟",
    "🜃 ♇ ⚘ 🝦",
    "⚛ 🜙 ⛧ 🝠",
    "☾ 🜤 ♅ ⸙",
    "🜨 ⚗ ☌ 🝧",
  ];

  const [voidSymbol, setVoidSymbol] = useState(voidSymbols[0]);
  const [chaosSymbol, setChaosSymbol] = useState(chaosSymbols[0]);
  const [warpSymbol, setWarpSymbol] = useState(warpSymbols[0]);

  // Rotate symbols every 2 seconds for maximum mysticism
  useEffect(() => {
    const interval = setInterval(() => {
      setVoidSymbol(
        voidSymbols[Math.floor(Math.random() * voidSymbols.length)],
      );
      setChaosSymbol(
        chaosSymbols[Math.floor(Math.random() * chaosSymbols.length)],
      );
      setWarpSymbol(
        warpSymbols[Math.floor(Math.random() * warpSymbols.length)],
      );
    }, 2000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Title variations - misspellings and different extensions
  const titleVariations = [
    "¥ØĐØ.ŁØŁ",
    "YODO.LOL",
    "YØDO.COM",
    "YODO.NET",
    "Y0D0.ORG",
    "YODO.WTF",
    "YODO.XYZ",
    "YODO.LIFE",
    "YØĐØ.IO",
    "Y0DO.APP",
    "YODO.ZONE",
    "YODO.CHAOS",
    "YODO.VOID",
    "Y̴O̴D̴O̴.̴L̴O̴L̴", // corrupted text
    "YODO.???",
    "YODO.EXE",
    "YOOD.LOL", // misspelled
    "YODO.LOI", // misspelled
    "YODO.LOL?",
    "YØÐØ.ŁØŁ",
    "Y҉O҉D҉O҉.L҉O҉L҉", // zalgo-lite
  ];

  // Subtitle variations
  const subtitleVariations = [
    "The mirror keeps asking for rent",
    "Someone replaced my shadow with dial tone",
    "The milk remembered my name today",
    "Your aura smells like battery acid and pine",
    "I found teeth in my Wi-Fi signal",
    "Don’t wink at the socket again",
    "My reflection owes me an apology",
    "The fridge hums in Morse for “hunger.”",
    "We buried the silence but it crawled back",
    "Ur voice left fingerprints",
    "The wallpaper is learning my passwords",
    "I saw your heartbeat on Bluetooth",
    "The air tastes like reboot",
    "My sleep has a loading bar now",
    "Someone’s licking the timestamps again",
    "The rain said my name in lowercase",
    "My bones are buffering",
    "I flirted with entropy—it texted back ✨",
    "The faucet moans in your key",
    "My toaster just gaslit me",
    "Stop smiling with all those elbows",
    "I kissed the static; it bit back 💋",
    "The lamp remembers what you did",
    "Your eyes log in without permission",
    "Gravity owes me child support",
    "Don’t trust the hallway; it edits itself",
    "I left sanity on read",
    "My veins sound like dial-up",
    "Your breath is in my inbox",
    "He touched the moon and it pressed charges",
    "I stapled my dreams to your voicemail",
    "The ocean blocked my number",
    "Someone replaced the horizon with code",
    "The wind keeps whispering safe words 😉",
    "Your shadow’s been spreading rumors",
    "I peeled the sky; it screamed",
    "Stop breathing like that—it’s contagious",
    "I heard your heartbeat through the firewall",
    "The floor tasted suspiciously alive",
    "Your reflection filed for divorce",
    "My laughter came with side effects",
    "Don’t blink in lowercase letters",
    "The moon owes me a cigarette",
    "You smell like unfinished sentences",
    "My smile has Wi-Fi now",
    "Keep talking; the knives love gossip 🔪",
    "I licked the socket for attention",
    "Your aura’s got pop-ups again",
    "The void left me on delivered",
    "I kissed the apocalypse goodnight",
    "The air’s too thick to swallow lies",
    "Stop blinking in binary",
    "My bed dreams of leaving me",
    "The static said you tasted familiar",
    "Don’t pet the silence—it bites",
    "My clock just confessed murder",
    "You owe me three screams and a coffee ☕",
    "The wallpaper whispered “again.”",
    "I saw your smile reboot",
    "My veins uploaded something sinful 😏",
    "Don’t feed the mirrors after dusk",
    "I asked God for a refund",
    "Your hands type too loudly on reality",
    "The sun DM’d me “u up?” 🌞",
    "My pulse has an error message",
    "Keep blinking; the walls get jealous",
    "You look edible in this light 😈",
    "I sneezed out a confession",
    "The storm left lipstick on my car",
    "Your laugh smells like old static",
    "I swallowed a secret and it barked",
    "The echo said “prove it.”",
    "Don’t wink at gravity—it remembers",
    "My heartbeat wrote you a threat",
    "The dust keeps rearranging itself into apologies",
    "You talk like a haunted typewriter",
    "I bit the future and it bled syntax",
    "The clouds are gossiping again",
    "My dreams have HR now",
    "You blinked wrong, and now it’s Thursday",
    "The thunder called you “sweetheart” ⚡",
    "I licked the algorithm",
    "Don’t laugh—it encourages the ceiling",
    "My soul’s been shadowbanned",
    "Your smile owes taxes",
    "The window winked first 😉",
    "I sneezed out a small universe",
    "The cat knows too much",
    "You smell like deleted files",
    "My heartbeat tripped over your name",
    "The reflection blinked first",
    "Don’t trust the carpet—it’s plotting",
    "I downloaded a ghost by accident",
    "The silence keeps typing",
    "Your lips sound encrypted 🔒",
    "I hugged the void; it called HR",
    "My bones hum your theme song",
    "The moon just left a voicemail",
    "I heard your name in the smoke alarm",
    "Don’t turn around yet—it’s still smiling",
    "The moon’s been fingering my mail again",
    "I can smell numbers when you talk backwards",
    "The ants keep leaving Yelp reviews of my skin",
    "Your teeth remember my dreams",
    "I replaced my tongue with an HDMI cable",
    "The ceiling fan called me “dad.”",
    "I woke up allergic to consensus",
    "The stars are spelling out “uninstall.”",
    "I saw God microwaving spaghetti in my lungs",
    "Your sweat hums in E-flat minor",
    "The elevator demanded blood type and vibes",
    "I caught time cheating with a stapler",
    "My knees downloaded the wrong firmware",
    "You taste like backup files",
    "I blinked once and it grew antlers",
    "The sky owes me an autopsy",
    "My echo’s pregnant again",
    "Don’t kiss the sun—it’s contagious 😏",
    "The clouds keep moaning about rent control",
    "My jaw’s been buffering since Thursday",
    "The clock spat out an apology in Morse",
    "I accidentally married a URL",
    "Your whisper left fingerprints in my coffee",
    "The dishwasher hummed “Ave Maria” again",
    "I buried a USB drive in the yard and now it’s sprouting hands",
    "The floor smells like divorce",
    "I keep finding bones in my Wi-Fi",
    "Your breath just formatted my soul",
    "The toaster winked too long",
    "My dreams smell like rented fingers",
    "I sneezed blood and confetti",
    "The fridge just told me it’s pregnant with soup",
    "Your skin keeps buffering",
    "I can hear my hair plotting",
    "The sink licked me first",
    "I bit gravity and it tasted like paperwork",
    "The doorbell keeps whispering “again.”",
    "My skeleton asked for PTO",
    "You’ve got that “haunted USB” kind of beauty",
    "The wind’s been DMing my organs",
    "I left my dignity in airplane mode",
    "The spoon is humming something erotic 😈",
    "My veins smell like burnt internet",
    "Your smile glitched into Latin",
    "I found Wi-Fi in my blood pressure",
    "The thunder called me “slut.” ⚡",
    "My brain’s been clocking in late to existence",
    "I kissed the socket again, but this time it remembered",
    "The grass keeps whispering union rules",
    "My teeth staged a walkout",
    "The mirror swallowed my emergency contact",
    "Your shadow’s been licking doorknobs again",
    "I burped up a small government",
    "The dust under my bed just started an OnlyFans",
    "You blinked in cursive",
    "My skeleton downloaded Chrome extensions",
    "The faucet called me “mommy.” 😏",
    "I bled Morse code and it spelled “oops.”",
    "The power outlet winked with intent",
    "You look like someone’s second draft",
    "My lungs signed up for a newsletter",
    "The carpet whispered “kneel.”",
    "I opened my mouth and the modem screamed",
    "The moon Venmo’d me 32 cents",
    "My sweat tastes like time travel",
    "You blinked, and the wallpaper climaxed 😳",
    "My laughter got subpoenaed",
    "The fridge just updated its terms of service",
    "I saw a cloud give birth to a fax machine",
    "The dirt whispered your real name",
    "My tongue’s been pirating emotions again",
    "You look like a lawsuit in heels",
    "The birds spelled “forgive” in lowercase",
    "My heartbeat smells like melted software",
    "I fed my anxiety to a vending machine",
    "The moon filed a restraining order",
    "I blinked and the city rebooted",
    "Your eyes look like unfinished firmware",
    "The air conditioner asked me to dance",
    "I replaced my tears with coolant",
    "The floorboards are humming your ringtone",
    "I kissed entropy goodnight, again 💋",
    "My elbow filed taxes separately",
    "The wind keeps moaning in 4K",
    "You smell like static and mercy",
    "The mirror’s learning sarcasm",
    "My scream got shadowbanned",
    "I licked the horizon for research",
    "The clouds coughed in binary",
    "My heart just blue-screened",
    "You wink like a glitch in heat",
    "The lightbulb told me to shut up",
    "My shadow’s been streaming illegal sunlight",
    "I sneezed into the metaverse",
    "The table winked twice; now I owe it money",
    "You look edible and encrypted",
    "The moon’s typing… still typing…",
    "I told time to stop; it bit me",
    "My skin installed an update mid-conversation",
    "The socket said it misses me",
  ];

  // Apply theme on mount and when theme changes
  useEffect(() => {
    ThemeEngine.applyTheme(theme);
  }, [theme]);

  // Auto-refresh theme every 45 seconds for MAXIMUM CHAOS
  useEffect(() => {
    const interval = setInterval(() => {
      changeTheme();
    }, 45000); // 45 seconds

    return () => clearInterval(interval);
  }, []);

  // Random title effects that change every 3 seconds
  useEffect(() => {
    const effects = [
      "glitch-text",
      "wave-text",
      "melt-text",
      "spiral-text",
      "",
    ];
    const interval = setInterval(() => {
      setTitleClass(effects[Math.floor(Math.random() * effects.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Random title text changes every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTitle =
        titleVariations[Math.floor(Math.random() * titleVariations.length)];
      setCurrentTitle(randomTitle);
    }, 4000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Random subtitle changes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomSubtitle =
        subtitleVariations[
          Math.floor(Math.random() * subtitleVariations.length)
        ];
      setCurrentSubtitle(randomSubtitle);
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshFeed = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/feed?limit=15");
      const data = await response.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Error refreshing feed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const changeTheme = async () => {
    setIsThemeChanging(true);
    try {
      const response = await fetch("/api/theme");
      const data = await response.json();
      if (data.theme) {
        setTheme(data.theme);
      }
    } catch (error) {
      console.error("Error changing theme:", error);
    } finally {
      setTimeout(() => setIsThemeChanging(false), 800);
    }
  };

  const refreshAll = async () => {
    setIsRefreshing(true);
    setIsThemeChanging(true);
    try {
      const [feedResponse, themeResponse] = await Promise.all([
        fetch("/api/feed?limit=15"),
        fetch("/api/theme"),
      ]);

      const [feedData, themeData] = await Promise.all([
        feedResponse.json(),
        themeResponse.json(),
      ]);

      if (feedData.posts) setPosts(feedData.posts);
      if (themeData.theme) setTheme(themeData.theme);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setIsThemeChanging(false), 800);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <motion.header
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1
          className={`text-5xl md:text-7xl font-bold mb-4 ${titleClass}`}
          style={{
            color: "var(--primary-color)",
            fontFamily: "var(--font-family)",
          }}
        >
          {currentTitle}
        </h1>
        <p
          className="text-lg md:text-xl mb-6 opacity-80"
          style={{ color: "var(--text-color)" }}
        >
          {currentSubtitle}
        </p>

        {/* Theme Info */}
        <motion.div
          className="inline-block px-6 py-3 rounded-full mb-6 float-random"
          style={{
            backgroundColor: "var(--secondary-color)",
            color: "var(--text-color)",
          }}
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Trigger warning: <strong className="glitch-text">{theme.mood}</strong>
        </motion.div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <button
            onClick={refreshAll}
            disabled={isRefreshing || isThemeChanging}
            className="px-6 py-3 rounded-lg font-semibold text-xl transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "var(--background-color)",
              borderRadius: "var(--border-radius)",
            }}
          >
            {isRefreshing ? "⚙ ⚙ ⚙" : voidSymbol}
          </button>

          <button
            onClick={refreshFeed}
            disabled={isRefreshing}
            className="px-6 py-3 rounded-lg font-semibold text-xl transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
            style={{
              backgroundColor: "var(--secondary-color)",
              color: "var(--background-color)",
              borderRadius: "var(--border-radius)",
            }}
          >
            {isRefreshing ? "⚙ ⚙ ⚙" : chaosSymbol}
          </button>

          <button
            onClick={changeTheme}
            disabled={isThemeChanging}
            className="px-6 py-3 rounded-lg font-semibold text-xl transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
            style={{
              backgroundColor: "var(--accent-color)",
              color: "var(--background-color)",
              borderRadius: "var(--border-radius)",
            }}
          >
            {isThemeChanging ? "⚙ ⚙ ⚙" : warpSymbol}
          </button>
        </div>

        {/* Auto-morph indicator */}
        <p
          className="mt-4 text-sm opacity-50"
          style={{ color: "var(--text-color)" }}
        >
          ⚠️ Reality shifts every 15 seconds ⚠️
        </p>
      </motion.header>

      {/* Feed */}
      {posts.length > 0 ? (
        <Feed initialPosts={posts} theme={theme} />
      ) : (
        <div className="text-center py-20">
          <p
            className="text-xl opacity-75"
            style={{ color: "var(--text-color)" }}
          >
            No posts found. Try refreshing!
          </p>
        </div>
      )}

      {/* Footer */}
      <motion.footer
        className="mt-16 text-center pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <p
          className="text-sm opacity-50"
          style={{ color: "var(--text-color)" }}
        >
          Powered by OpenAI + Reddit + Severe Mental Instability
        </p>
        <p
          className="text-xs opacity-30 mt-2"
          style={{ color: "var(--text-color)" }}
        >
          nothing is real. everything is permitted. reality is optional.
        </p>
      </motion.footer>
    </div>
  );
}
