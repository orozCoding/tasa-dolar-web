import { Carousel } from "@material-tailwind/react";
import indexImg from "/ss-index.png"
import darkModeImg from "/ss-darkmode.png"
import pagomovilImg from "/ss-pagomovil.png"
import newsImg from "/ss-news.png"
import aboutImg from "/ss-about.png"
import { ArrowLeft, ArrowRight } from "../utils/arrowIcons"
 
export function Gallery() {

  const prevArrow = (loop, handlePrev, firstIndex) => {
    return(
      <button
        onClick={handlePrev}
        disabled={!loop && firstIndex}
        className="!absolute top-2/4 left-4 -translate-y-2/4 rounded-full select-none transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none w-12 max-w-[48px] h-12 max-h-[48px] text-black dark:text-white hover:dark:bg-white/10 hover:bg-black/10  active:bg-white/30 grid place-items-center cursor-pointer"
      >
        <ArrowLeft />
      </button>
    )
  }

  const nextArrow = (loop, handleNext, lastIndex) => {
    return(
      <button
        onClick={handleNext}
        disabled={!loop && lastIndex}
        className="!absolute top-2/4 right-4 -translate-y-2/4 rounded-full select-none transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none w-12 max-w-[48px] h-12 max-h-[48px] text-black dark:text-white hover:dark:bg-white/10 hover:bg-black/10  active:bg-white/30 grid place-items-center cursor-pointer"
        >
        <ArrowRight />
      </button>
    )
  }

  const imgClass = "h-full m-auto object-contain rounded-xl object-center cursor-pointer shadow-lg border border-gray-200"

  return (
    <Carousel
      loop={true}
      autoplay={true}
      className="overflow-hidden rounded-xl flex items-center text-red-400 py-8"
      autoplayDelay={3000}
      transition={
        { type: "tween", duration: 0.3 }
      }
      prevArrow={({ loop, handlePrev, firstIndex }) => prevArrow(loop, handlePrev, firstIndex)}
      nextArrow={({ loop, handleNext, lastIndex }) => nextArrow(loop, handleNext, lastIndex)}
   >
      <img
        src={indexImg}
        alt="image 1"
        className={imgClass}
        onClick={() => window.open("/ss-index.png", "_blank")}
      />
      <img
        src={darkModeImg}
        alt="image 2"
        className={imgClass}
        onClick={() => window.open("/ss-darkmode.png", "_blank")}
      />
      <img
        src={pagomovilImg}
        alt="image 3"
        className={imgClass}
        onClick={() => window.open("/ss-pagomovil.png", "_blank")}
      />
      <img
        src={newsImg}
        alt="image 4"
        className={imgClass}
        onClick={() => window.open("/ss-news.png", "_blank")}
      />
      <img
        src={aboutImg}
        alt="image 5"
        className={imgClass}
        onClick={() => window.open("/ss-about.png", "_blank")}
      />
    </Carousel>
  );
}