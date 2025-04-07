import React, { useState } from 'react';
import { Button, Tooltip } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import { Interaction } from '../../src/types/types';
import { exportToExcel } from '../utils/excelExport';
import toast from 'react-hot-toast';

interface ExportButtonProps {
  interactions: Interaction[];
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ interactions, disabled }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportToExcel(interactions);
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar o relatório. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Tooltip title="Exportar interações para Excel" arrow>
      <span>
        <Button
          onClick={handleExport}
          disabled={disabled || isExporting || interactions.length === 0}
          variant="contained"
          startIcon={<GetAppIcon />}
          aria-label="Exportar para Excel"
          sx={{
            backgroundColor: '#ff9800',
            color: 'white',
            '&:hover': {
              backgroundColor: '#f57c00',
            },
            '&:focus': {
              outline: '2px solid #ff9800',
              outlineOffset: '2px',
            },
          }}
        >
          {isExporting ? 'Exportando...' : 'Exportar Excel'}
        </Button>
      </span>
    </Tooltip>
  );
};

