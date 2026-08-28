import fiat from "@/assets/logos/fiat.svg";
import volkswagen from "@/assets/logos/volkswagen.svg";
import ford from "@/assets/logos/ford.svg";
import renault from "@/assets/logos/renault.svg";
import peugeot from "@/assets/logos/peugeot.svg";
import toyota from "@/assets/logos/toyota.svg";
import citroen from "@/assets/logos/citroen.svg";
import opel from "@/assets/logos/opel.svg";
import nissan from "@/assets/logos/nissan.svg";
import hyundai from "@/assets/logos/hyundai.svg";
import mercedes from "@/assets/logos/mercedes.svg";
import audi from "@/assets/logos/audi.svg";
import mini from "@/assets/logos/mini.svg";

const BRANDS = [
  { name: "Fiat", src: fiat },
  { name: "Volkswagen", src: volkswagen },
  { name: "Ford", src: ford },
  { name: "Renault", src: renault },
  { name: "Peugeot", src: peugeot },
  { name: "Toyota", src: toyota },
  { name: "Citroën", src: citroen },
  { name: "Opel", src: opel },
  { name: "Nissan", src: nissan },
  { name: "Hyundai", src: hyundai },
  { name: "Mercedes-Benz", src: mercedes },
  { name: "Audi", src: audi },
  { name: "Mini", src: mini },
];

export function BrandLogos() {
  return (
    <section className="bg-grigio-chiaro py-14">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-grigio-testo/70">
          Le marche con cui lavoriamo
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-12">
          {BRANDS.map((brand) => (
            <img
              key={brand.name}
              src={brand.src}
              alt={brand.name}
              title={brand.name}
              className="h-8 w-auto max-w-[100px] object-contain opacity-80 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 sm:h-10 sm:max-w-[130px]"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
