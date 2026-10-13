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
        display: { xs: 'none', sm: 'grid' },
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

  return (
    <>
      {desktop}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          margin: '0 auto',
        }}
        className={className}
      >
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Versão Mobile */}
              <Box
                sx={{
                  display: { xs: 'flex', sm: 'none' },
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: isActive ? '100%' : 'fit-content',
                  marginRight: !isLast && !isActive ? '16px' : '0',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: '4px',
                    width: 'fit-content',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => onStepClick(index)}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      height: '24px',
                      width: '24px',
                      flexShrink: 0,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor:
                        isActive || isCompleted
                          ? theme.palette.primary.main
                          : '#E0E0E0',
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
                      <span>{index + 1}</span>
                    )}
                  </Box>
                  {isActive && (
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        color: isActive
                          ? theme.palette.primary.main
                          : isCompleted
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                      }}
                    >
                      {step.label}
                    </span>
                  )}
                  {index < steps.length - 1 && (
                    <Box
                      sx={{
                        width: '100%',
                        height: '2px',
                        backgroundColor:
                          currentStep > step.id
                            ? theme.palette.primary.main
                            : '#E0E0E0',
                      }}
                    />
                  )}
                </Box>
              </Box>
            </React.Fragment>
          );
        })}
      </Box>
    </>
  );
};
