"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

type Card = {
  title: string;
  description: string;
  skeleton: React.ReactNode;
  className: string;
  config: {
    y: number;
    zIndex: number;
  };
};

type SpringConfig = {
  type: "spring";
  bounce?: number;
  visualDuration?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
};

export interface CardsProps {
  spring?: SpringConfig;
  activeScale?: number;
  cardSpacing?: number;
}

const defaultSpring: SpringConfig = {
  type: "spring",
  visualDuration: 0.6,
  bounce: 0.25,
};

export const controls = {
  spring: defaultSpring,
  activeScale: [1.15, 1, 1.6, 0.01],
  cardSpacing: [180, 40, 320, 5],
};

export const Cards = ({
  spring = defaultSpring,
  activeScale = 1.15,
  cardSpacing = 180,
}: CardsProps = {}) => {
  const cards = [
    {
      title: "Working Knowledge",
      description:
        "You have a basic understanding of the topic and can apply it to simple situations.",
      skeleton: (
        <div className="h-50 w-full rounded-xl bg-linear-to-r from-orange-600 to-orange-600/40"></div>
      ),
      className: "bg-orange-500 [&_h2]:text-white",
      config: {
        y: -20,
        x: 0,
        rotate: -15,
        zIndex: 2,
      },
    },

    {
      title: "Practical Demonstration",
      description:
        "You can demonstrate the concept in practice with real-world examples.",
      skeleton: (
        <div className="h-50 w-full rounded-xl bg-linear-to-r from-neutral-300 to-neutral-400/40"></div>
      ),
      className: "bg-stone-200 [&_p]:text-black",
      config: {
        y: 20,
        x: 180,
        rotate: 8,
        zIndex: 3,
      },
    },
    {
      title: "Collaborate with AI",
      description:
        "You can effectively work alongside AI tools to enhance your workflow.",
      skeleton: (
        <div className="h-50 w-full rounded-xl bg-linear-to-r from-blue-600 to-blue-600/40"></div>
      ),
      className: "bg-blue-500 [&_h2]:text-white",
      config: {
        y: -80,
        x: 360,
        rotate: -5,
        zIndex: 4,
      },
    },
    {
      title: "Means & Methods",
      description:
        "You understand the various approaches and techniques available.",
      skeleton: (
        <div className="h-50 w-full rounded-xl bg-linear-to-r from-purple-600 to-purple-600/40"></div>
      ),
      className: "bg-purple-500 [&_h2]:text-white",
      config: {
        y: 20,
        x: 540,
        rotate: 12,
        zIndex: 5,
      },
    },
    {
      title: "Interface Kit",
      description:
        "You have the tools and components needed to build interfaces.",
      skeleton: (
        <div className="h-50 w-full rounded-xl bg-linear-to-r from-neutral-950 to-neutral-950/40"></div>
      ),
      className: "bg-neutral-900 [&_h2]:text-white",
      config: {
        y: 20,
        x: 720,
        rotate: -5,
        zIndex: 6,
      },
    },
  ];

  const [active, setActive] = useState<Card | null>(null);
  const [spacing, setSpacing] = useState(cardSpacing);

  const ref = useRef<HTMLDivElement>(null);

  const cardSpring = spring;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setActive(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () =>
      setSpacing(mq.matches ? cardSpacing : Math.round(cardSpacing * 0.39));
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [cardSpacing]);

  const middle = (cards.length - 1) / 2;

  const isAnyCardActive = () => {
    return active?.title;
  };

  const isCurrentActive = (card: Card) => {
    return active?.title === card.title;
  };
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <motion.div
        ref={ref}
        onClick={() => setActive(null)}
        className="relative mx-auto flex h-120 w-full max-w-5xl items-center justify-center [--height:300px] [--width:220px] lg:[--height:400px] lg:[--width:300px]"
      >
        {cards.map((card, index) => {
          const offsetX = (index - middle) * spacing;
          return (
            <motion.div key={card.title}>
              <motion.button
                initial={{
                  x: 0,
                  scale: 0,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActive(card);
                }}
                animate={{
                  y: isCurrentActive(card)
                    ? 0
                    : isAnyCardActive()
                      ? 400
                      : card.config.y,
                  x: isCurrentActive(card)
                    ? 0
                    : isAnyCardActive()
                      ? offsetX * 0.4
                      : offsetX,
                  rotate: isCurrentActive(card)
                    ? 0
                    : isAnyCardActive()
                      ? 0.2 * card.config.rotate
                      : card.config.rotate,
                  scale: isCurrentActive(card)
                    ? activeScale
                    : isAnyCardActive()
                      ? 0.7
                      : 1,
                }}
                whileHover={{
                  scale: isCurrentActive(card)
                    ? activeScale
                    : isAnyCardActive()
                      ? 0.7
                      : 1.05,
                }}
                transition={cardSpring}
                style={{
                  width: `var(--width)`,
                  height: `var(--height)`,
                  marginLeft: `calc(var(--width) / -2)`,
                  marginTop: `calc(var(--height) / -2)`,
                  zIndex: isCurrentActive(card) ? 50 : card.config.zIndex,
                }}
                className={cn(
                  "absolute top-1/2 left-1/2 flex cursor-pointer flex-col items-start justify-between overflow-hidden rounded-2xl p-2 md:p-4",
                  card.className,
                )}
              >
                {card.skeleton}
                <div className="mt-5">
                  <motion.h2
                    layoutId={card.title + "title"}
                    className="font-regular max-w-40 text-left text-base md:text-3xl"
                  >
                    {card.title}
                  </motion.h2>
                  <AnimatePresence mode="popLayout">
                    {active?.title === card.title && (
                      <motion.p
                        layoutId={card.title + "description"}
                        initial={{ opacity: 0, x: 20, y: 20, height: 0 }}
                        animate={{ opacity: 1, x: 0, y: 0, height: 100 }}
                        exit={{ opacity: 0, x: 40, y: 40 }}
                        transition={cardSpring}
                        className="mt-3 text-left text-sm text-white/80 md:text-base"
                      >
                        {card.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Cards;
