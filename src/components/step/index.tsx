import { Check } from '@mui/icons-material';
import { Box } from '@mui/material';
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

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        margin: '0 auto',
      }}
      className={className}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const StepIcon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <React.Fragment key={step.id}>
            {/* Versão Desktop */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                width: isLast ? 'fit-content' : '100%',
              }}
              //   className="sm:flex"
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    height: '40px',
                    width: '40px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor:
                      isActive || isCompleted ? '#28166F' : '#E0E0E0',
                    backgroundColor: isActive
                      ? '#28166F'
                      : isCompleted
                      ? 'rgba(40, 22, 111, 0.1)'
                      : 'transparent',
                    color: isActive
                      ? '#FFFFFF'
                      : isCompleted
                      ? '#28166F'
                      : '#727272',
                    transition: 'all 0.3s',
                  }}
                >
                  {isCompleted ? (
                    <Check style={{ height: '20px', width: '20px' }} />
                  ) : (
                    <StepIcon style={{ height: '20px', width: '20px' }} />
                  )}
                </Box>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    color: isActive
                      ? '#28166F'
                      : isCompleted
                      ? 'rgba(40, 22, 111, 0.8)'
                      : '#727272',
                  }}
                >
                  {step.label}
                </span>
              </Box>
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    width: '100%',
                    height: '2px',
                    margin: '0 8px',
                    marginBottom: '16px',
                    backgroundColor:
                      currentStep > step.id ? '#28166F' : '#E0E0E0',
                  }}
                />
              )}
            </Box>

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
                      isActive || isCompleted ? '#28166F' : '#E0E0E0',
                    backgroundColor: isActive
                      ? '#28166F'
                      : isCompleted
                      ? 'rgba(40, 22, 111, 0.1)'
                      : 'transparent',
                    color: isActive
                      ? '#FFFFFF'
                      : isCompleted
                      ? '#28166F'
                      : '#727272',
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
                        ? '#28166F'
                        : isCompleted
                        ? 'rgba(40, 22, 111, 0.8)'
                        : '#727272',
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
                        currentStep > step.id ? '#28166F' : '#E0E0E0',
                    }}
                  />
                )}
              </Box>
            </Box>
          </React.Fragment>
        );
      })}
    </Box>
  );
};
