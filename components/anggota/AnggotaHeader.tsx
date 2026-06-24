import { Bell } from "lucide-react";

interface Props {
  title: string;
  subtitle: string;
}

export default function AnggotaHeader({
  title,
  subtitle,
}: Props) {
  return (
    <div
      className="
        h-[86px]
        bg-[#D9E63B]
        px-8
        flex
        items-center
        justify-between
      "
    >
      <div>
        <h1 className="text-[20px] font-bold text-[#23244D]">
          {title}
        </h1>

        <p className="text-sm text-[#6D6D85]">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="
            w-11
            h-11
            rounded-full
            bg-white
            flex
            items-center
            justify-center
          "
        >
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div
            className="
              w-11
              h-11
              rounded-full
              bg-[#7C67EE]
              text-white
              flex
              items-center
              justify-center
              font-semibold
            "
          >
            MA
          </div>

          <div>
            <p className="font-semibold text-[#23244D]">
              Maysha Akmala
            </p>

            <p className="text-sm text-[#6D6D85]">
              Anggota
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}