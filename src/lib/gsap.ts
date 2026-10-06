import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, Flip, CustomEase);
gsap.defaults({ ease: "power3.out", duration: 0.9 });

/** Curvas da casa: saída longa e suave, e entrada/saída simétrica para transições. */
CustomEase.create("out", "0.16, 1, 0.3, 1");
CustomEase.create("inOut", "0.76, 0, 0.24, 1");

export { gsap, ScrollTrigger, SplitText, Flip };
