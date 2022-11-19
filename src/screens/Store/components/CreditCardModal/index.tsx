import { Button } from '@components/Button';
import { Modal } from '@components/Modal';
import { useAuthContext } from '@contexts/AuthContext';
import { ApiRoutes } from '@enums/apiRoutes.enum';
import { apiClient } from '@services/apiClient';
import { useEffect, useState } from 'react';
import { CreditCard } from '../CreditCard';
import { RegisterCreditCardModal } from '../RegisterCreditCardModal';

interface CreditCardApiResponse {
  created_at: string;
  cvc: number;
  deleted_at: string | null;
  expirationMonth: number;
  expirationYear: number;
  id: number;
  number: string;
  ownerId: number;
  updated_at: string;
}

interface CreditCardModalProps {
  isOpen: boolean;
  selectCreditCard: (creditCardId: number) => void;
}

export function CreditCardModal({
  isOpen,
  selectCreditCard,
}: CreditCardModalProps) {
  const { user } = useAuthContext();

  const [creditCards, setCreditsCards] = useState<CreditCardApiResponse[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await apiClient.get<CreditCardApiResponse[]>(
          `${ApiRoutes.CREDIT_CARDS_BY_USER}/${user!.id}`
        );

        setCreditsCards(response.data);
      } catch {
        setCreditsCards([]);
      }
    })();
  }, []);

  const [registerCreditCardModalIsOpen, setRegisterCreditCardModalIsOpen] =
    useState(false);

  function openRegisterCreditCardModal() {
    setRegisterCreditCardModalIsOpen(true);
  }

  function closeRegisterCreditCardModal() {
    setRegisterCreditCardModalIsOpen(false);
  }

  return (
    <>
      <RegisterCreditCardModal
        isOpen={registerCreditCardModalIsOpen}
        closeModal={closeRegisterCreditCardModal}
      />
      <Modal
        text="Selecione um cartão para realizar a compra de créditos"
        animationType="fade"
        visible={isOpen}
      >
        <Button
          text="Adicionar cartão de crédito"
          onPress={openRegisterCreditCardModal}
        />

        {creditCards.map((creditCard) => {
          const formattedDate = `${creditCard.expirationMonth}/${creditCard.expirationYear}`;

          return (
            <CreditCard
              key={creditCard.id}
              owner={user!.name}
              number={creditCard.number}
              cvc={String(creditCard.cvc)}
              dueDate={formattedDate}
              onSelectCard={() => selectCreditCard(creditCard.id)}
            />
          );
        })}
      </Modal>
    </>
  );
}
