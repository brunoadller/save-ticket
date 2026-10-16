import { Ticket, TicketFormData } from "../../types";
import { Modal } from "../ui/Modal";
import { TicketForm } from "./TicketForm";

interface Props {
  ticketExistente?: Ticket | null;
  onClose: () => void;
  onSubmit: (data: TicketFormData) => Promise<void>;
}

export function TicketFormModal({ ticketExistente, onClose, onSubmit }: Props) {
  return (
    <Modal title={ticketExistente ? "Editar chamado" : "Novo chamado"} onClose={onClose}>
      <TicketForm
        ticketExistente={ticketExistente}
        onCancel={onClose}
        onSubmit={async (data) => {
          await onSubmit(data);
          onClose();
        }}
      />
    </Modal>
  );
}
