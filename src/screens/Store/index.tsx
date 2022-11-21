import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { NumberInput } from '@components/NumberInput';
import { ScrollScreenContainer } from '@styles/defaults';
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { format, addHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatPrice } from '@utils/formatPrice';
import { Input } from '@components/Input';
import { useNotify } from '@hooks/useNotify';
import { apiClient } from '@services/apiClient';
import { ApiRoutes } from '@enums/apiRoutes.enum';
import { useAuthContext } from '@contexts/AuthContext';
import { Validations } from '@enums/validations.enum';
import { BuyByCreditCard } from './components/BuyByCreditCard';
import {
  SelectVehicleModal,
  // eslint-disable-next-line no-unused-vars
  VehicleData,
} from './components/SelectVehicleModal';
import {
  LeftText,
  LineContainer,
  RightText,
  SelectContainer,
  SelectText,
} from './styles';
import { SwitchSaleType } from './components/SwitchSaleType';

export interface PaymentFormData {
  credits: number;
  vehiclePlate: string;
  type: 'creditCard' | 'pix';
  cardNumber?: string;
  securityCode?: number;
  expirationMonth?: number;
  expirationYear?: number;
  cardBrand?: string;
  description: string;
}

export function StoreScreen() {
  const { errorNotify, successNotify } = useNotify();

  const { user } = useAuthContext();

  const formMethods = useForm<PaymentFormData>({
    defaultValues: {
      credits: 1,
      vehiclePlate: '',
      type: 'creditCard',
      cardNumber: '',
      securityCode: 0,
      expirationMonth: 0,
      expirationYear: 0,
      cardBrand: '',
      description: '',
    },
  });

  const {
    control,
    setValue,
    watch,
    getValues,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = formMethods;

  const typeWatched = watch('type');
  const creditsWatched = watch('credits');
  const vehiclePlateWatched = watch('vehiclePlate');

  const finalDate = format(
    addHours(new Date(), creditsWatched),
    'dd/MM/yy hh:mm:ss',
    {
      locale: ptBR,
    }
  );

  function addCredit() {
    const currentCredit = getValues('credits');

    setValue('credits', currentCredit + 1);
  }

  function removeCredit() {
    const currentCredit = getValues('credits');

    if (currentCredit <= 1) {
      return;
    }

    setValue('credits', currentCredit - 1);
  }

  async function registerPayment({
    credits,
    vehiclePlate,
    type,
    cardNumber,
    securityCode,
    expirationMonth,
    expirationYear,
    cardBrand,
    description,
  }: PaymentFormData) {
    try {
      const pixPaymentData = {
        method: type,
        name: user?.name,
        cpf: user?.cpf,
        email: user?.email,
        license_plate: vehiclePlate,
        credits,
        description,
      };

      const creditCardPaymentData = {
        ...pixPaymentData,
        card_info: {
          card_number: cardNumber?.replace(/\s/g, ''),
          card_holder_name: user?.name,
          card_holder_cpf: user?.cpf,
          securityCode,
          expiration_month: expirationMonth,
          expiration_year: expirationYear,
          card_brand: cardBrand,
        },
        installments: 1,
      };

      await apiClient.post(
        ApiRoutes.PAYMENTS,
        type === 'creditCard' ? creditCardPaymentData : pixPaymentData
      );

      reset();

      successNotify({
        title: 'Compra registrada',
        message: 'A compra foi registrada como pendente',
      });
    } catch {
      reset();

      errorNotify({
        title: 'Error na compra de créditos',
        message: 'Error ao registrar compra, tente novamente',
      });
    }
  }

  const [vehicleModalIsOpen, setVehicleModalIsOpen] = useState(false);

  function handleOpenVehicleModal() {
    setVehicleModalIsOpen(true);
  }

  function selectVehiclePlate({ plate }: VehicleData) {
    setValue('vehiclePlate', plate);
    setVehicleModalIsOpen(false);
  }

  return (
    <FormProvider {...formMethods}>
      <ScrollScreenContainer>
        <Card
          title="Comprar Créditos"
          subtitle="Compre créditos de estacionamento"
        >
          <SwitchSaleType setValue={setValue} type={typeWatched} />

          <LineContainer>
            <LeftText>Quantidade de Créditos</LeftText>

            <NumberInput
              number={creditsWatched}
              add={addCredit}
              remove={removeCredit}
            />
          </LineContainer>

          <LineContainer>
            <LeftText>Validade</LeftText>
            <RightText>{finalDate}</RightText>
          </LineContainer>

          <LineContainer>
            <LeftText>Total</LeftText>
            <RightText>{formatPrice(creditsWatched * 7.5)}</RightText>
          </LineContainer>

          {typeWatched === 'creditCard' && <BuyByCreditCard />}

          <SelectVehicleModal
            isOpen={vehicleModalIsOpen}
            selectVehiclePlate={selectVehiclePlate}
          />

          <SelectContainer onPress={handleOpenVehicleModal}>
            {vehiclePlateWatched ? (
              <SelectText>{vehiclePlateWatched}</SelectText>
            ) : (
              <SelectText>Selecionar Veículo</SelectText>
            )}
          </SelectContainer>

          <Input
            inputProps={{
              placeholder: 'Descrição...',
            }}
            controllerProps={{
              control,
              name: 'description',
              rules: {
                required: {
                  value: true,
                  message: Validations.REQUIRED,
                },
              },
            }}
            errorMessage={errors.description?.message}
          />

          <Button
            text="Confirmar Compra"
            onPress={() => handleSubmit(registerPayment)}
            mt={10}
            isLoading={isSubmitting}
          />
        </Card>
      </ScrollScreenContainer>
    </FormProvider>
  );
}
