import { Check } from '@mui/icons-material';
import { alpha, Box, useTheme } from '@mui/material';
import React from 'react';

interface Step {
  label?: string;
  id: number;
  icon: React.ElementType;
}

interface StepProgressProps {
  steps: Step[];
  className?: string;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

/**
 * Abaixo de 810px os círculos com rótulo não cabem: os nove passos do cadastro
 * de evento espremem os nomes já num tablet em pé. Daí para baixo, a régua
 * compacta.
 */
const COMPACTA = '@media (max-width: 809.95px)';

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  setCurrentStep,
  className,
}) => {
  const onStepClick = (index: number) => {
    setCurrentStep(steps[index].id);
  };
  const theme = useTheme();
  const corDaLinha = (feita: boolean) =>
    feita ? theme.palette.primary.main : theme.palette.border;

  /**
   * Desktop: uma coluna de largura igual por etapa, o ícone no centro dela e
   * a linha ligando o centro de um ícone ao do próximo — todas do mesmo
   * tamanho, qualquer que seja o rótulo. Antes cada etapa media o próprio
   * rótulo, e as linhas ficavam de tamanhos diferentes. O rótulo centraliza
   * embaixo e quebra em duas linhas se precisar.
   */
  const desktop = (
    <Box
      sx={{
        display: 'grid',
        [COMPACTA]: { display: 'none' },
        gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
        width: '100%',
      }}
    >
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const meia = (lado: 'left' | 'right', feita: boolean) => (
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              [lado]: 0,
              width: 'calc(50% - 28px)',
              height: '2px',
              backgroundColor: corDaLinha(feita),
              transition: 'background-color 0.3s',
            }}
          />
        );
        return (
          <Box
            key={step.id}
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              px: 0.5,
            }}
          >
            {index > 0 && meia('left', currentStep >= step.id)}
            {index < steps.length - 1 && meia('right', isCompleted)}
            <Box
              sx={{
                display: 'flex',
                height: '40px',
                width: '40px',
                flexShrink: 0,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '2px solid',
                borderColor:
                  isActive || isCompleted
                    ? theme.palette.primary.main
                    : theme.palette.border,
                backgroundColor: isActive
                  ? theme.palette.primary.main
                  : isCompleted
                    ? alpha(theme.palette.primary.main, 0.2)
                    : 'transparent',
                color: isActive
                  ? '#FFFFFF'
                  : isCompleted
                    ? theme.palette.primary.main
                    : theme.palette.text.primary,
                transition: 'all 0.3s',
              }}
            >
              {isCompleted ? (
                <Check style={{ height: '20px', width: '20px' }} />
              ) : (
                <StepIcon style={{ height: '20px', width: '20px' }} />
              )}
            </Box>
            <Box
              component="span"
              sx={{
                fontSize: '12px',
                fontWeight: isActive ? 600 : 500,
                lineHeight: 1.3,
                textAlign: 'center',
                color:
                  isActive || isCompleted
                    ? theme.palette.primary.main
                    : theme.palette.text.primary,
              }}
            >
              {step.label}
            </Box>
          </Box>
        );
      })}
    </Box>
  );

  /**
   * Compacta: os círculos não cabem (nove passos mais o rótulo davam ~470px numa
   * tela de 300 e cortavam a régua). Fica "Passo 1 de 9" com o nome do passo
   * (reticências se não couber) e uma barra em segmentos, um por passo — feito
   * e atual na cor do módulo. O segmento leva ao passo, como o círculo levava.
   */
  const atual = steps.findIndex((step) => step.id === currentStep);
  const compacta = (
    <Box
      sx={{ display: 'none', [COMPACTA]: { display: 'block' }, width: '100%' }}
      className={className}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 1,
          minWidth: 0,
          mb: 1,
        }}
      >
        <Box
          component="span"
          sx={{
            flexShrink: 0,
            fontSize: '12px',
            fontWeight: 600,
            color: theme.palette.text.secondary,
          }}
        >
          Passo {atual + 1} de {steps.length}
        </Box>
        <Box
          component="span"
          sx={{
            minWidth: 0,
            fontSize: '14px',
            fontWeight: 600,
            color: theme.palette.primary.main,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {steps[atual]?.label}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: '4px' }}>
        {steps.map((step, index) => (
          <Box
            key={step.id}
            component="button"
            type="button"
            aria-label={`Ir para o passo ${index + 1}: ${step.label ?? ''}`}
            aria-current={step.id === currentStep ? 'step' : undefined}
            onClick={() => onStepClick(index)}
            sx={{
              flex: 1,
              minWidth: 0,
              // a área de toque é mais alta que a barra que se vê
              py: '8px',
              px: 0,
              border: 0,
              background: 'none',
              cursor: 'pointer',
              '&::before': {
                content: '""',
                display: 'block',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: corDaLinha(currentStep >= step.id),
                transition: 'background-color 0.3s',
              },
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
                borderRadius: '2px',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );

  return (
    <>
      {desktop}
      {compacta}
    </>
  );
};
