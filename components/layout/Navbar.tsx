import { Bell } from "lucide-react";

interface NavbarProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
}

export default function Navbar({
  title = "Dashboard",
  subtitle = "Selamat datang kembali, Admin!",
  userName = "JessicaMays",
  userRole = "Pustakawan",
}: NavbarProps) {
  return (
    <header
      style={{
        height: "86px",
        background: "#DFE94B",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 32px",
      }}
    >
      {/* Left */}
      <div>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "#1A1A1A",
            margin: 0,
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: 0,
            color: "#666",
            fontSize: "14px",
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
        }}
      >
        {/* Notification */}
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Bell size={18} color="#836CEC" />
        </div>

        {/* Avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#836CEC",
              color: "white",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            JM
          </div>

          <div>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                color: "#1A1A1A",
              }}
            >
              {userName}
            </p>

            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#666",
              }}
            >
              {userRole}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}