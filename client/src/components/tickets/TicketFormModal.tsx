import { Ticket, TicketFormData } from "../../types";
import { Modal } from "../ui/Modal";
import { TicketForm } from "./TicketForm";

interface Props {
  ticketExistente?: Ticket | null;
  onClose: () => void;
  onSubmit: (data: TicketFormData) => Promise<void>;
  onCourseRenamed: () => void;
}

export function TicketFormModal({ ticketExistente, onClose, onSubmit, onCourseRenamed }: Props) {
  return (
    <Modal title={ticketExistente ? "Editar chamado" : "Novo chamado"} onClose={onClose}>
      <TicketForm
        ticketExistente={ticketExistente}
        onCancel={onClose}
        onCourseRenamed={onCourseRenamed}
        onSubmit={async (data) => {
          await onSubmit(data);
          onClose();
        }}
      />
    </Modal>
  );
}
