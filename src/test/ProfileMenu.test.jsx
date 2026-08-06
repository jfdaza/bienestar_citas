import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileMenu } from "../features/appointments/components/ProfileMenu";

describe("ProfileMenu", () => {
  const mockSignOut = vi.fn();
  const mockProfile = {
    full_name: "Juan Pérez",
    email: "juan@sena.edu.co",
    role: "Aprendiz",
    document_number: "12345678",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user name and email", () => {
    render(
      <ProfileMenu profile={mockProfile} signOut={mockSignOut} totalAppointments={5} />
    );
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("juan@sena.edu.co")).toBeInTheDocument();
  });

  it("shows total appointments count", () => {
    render(
      <ProfileMenu profile={mockProfile} signOut={mockSignOut} totalAppointments={5} />
    );
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Total citas")).toBeInTheDocument();
  });

  it("shows user initial in avatar", () => {
    render(
      <ProfileMenu profile={mockProfile} signOut={mockSignOut} totalAppointments={5} />
    );
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("expands menu on click", () => {
    render(
      <ProfileMenu profile={mockProfile} signOut={mockSignOut} totalAppointments={5} />
    );
    
    // Find the clickable header element (has cursor: pointer style)
    const nameEl = screen.getByText("Juan Pérez");
    let clickTarget = nameEl;
    while (clickTarget && !clickTarget.style?.cursor?.includes("pointer")) {
      clickTarget = clickTarget.parentElement;
    }
    if (!clickTarget) {
      // Fallback: click on the name element's parent chain
      clickTarget = nameEl.parentElement?.parentElement;
    }
    fireEvent.click(clickTarget);

    // Check expanded content
    expect(screen.getByText("Editar perfil")).toBeInTheDocument();
    expect(screen.getByText("Configuración")).toBeInTheDocument();
    expect(screen.getByText("Ayuda y soporte")).toBeInTheDocument();
    expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();
  });

  it("calls signOut when logout button clicked", () => {
    render(
      <ProfileMenu profile={mockProfile} signOut={mockSignOut} totalAppointments={5} />
    );
    
    // Expand menu first
    const nameEl = screen.getByText("Juan Pérez");
    let clickTarget = nameEl;
    while (clickTarget && !clickTarget.style?.cursor?.includes("pointer")) {
      clickTarget = clickTarget.parentElement;
    }
    if (!clickTarget) clickTarget = nameEl.parentElement?.parentElement;
    fireEvent.click(clickTarget);

    // Click logout
    const logoutBtn = screen.getByText("Cerrar sesión");
    fireEvent.click(logoutBtn);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("shows document number when available", () => {
    render(
      <ProfileMenu profile={mockProfile} signOut={mockSignOut} totalAppointments={5} />
    );
    
    // Expand menu
    const nameEl = screen.getByText("Juan Pérez");
    let clickTarget = nameEl;
    while (clickTarget && !clickTarget.style?.cursor?.includes("pointer")) {
      clickTarget = clickTarget.parentElement;
    }
    if (!clickTarget) clickTarget = nameEl.parentElement?.parentElement;
    fireEvent.click(clickTarget);

    expect(screen.getByText("Doc: 12345678")).toBeInTheDocument();
  });

  it("shows role in stats", () => {
    render(
      <ProfileMenu profile={mockProfile} signOut={mockSignOut} totalAppointments={5} />
    );
    expect(screen.getByText("Aprendiz")).toBeInTheDocument();
  });

  it("shows edit profile modal", () => {
    render(
      <ProfileMenu profile={mockProfile} signOut={mockSignOut} totalAppointments={5} />
    );
    
    // Expand menu
    const nameEl = screen.getByText("Juan Pérez");
    let clickTarget = nameEl;
    while (clickTarget && !clickTarget.style?.cursor?.includes("pointer")) {
      clickTarget = clickTarget.parentElement;
    }
    if (!clickTarget) clickTarget = nameEl.parentElement?.parentElement;
    fireEvent.click(clickTarget);

    // Click edit profile
    const editBtn = screen.getByText("Editar perfil");
    fireEvent.click(editBtn);

    // Check modal is open
    expect(screen.getByText("Guardar")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });
});
