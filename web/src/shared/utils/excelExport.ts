import * as XLSX from 'xlsx';
// Define the Interaction type here
interface Interaction {
  id: string;
  title: string;
  description?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

interface ExcelColumn {
  header: string;
  key: string;
  width: number;
  formatter?: (value: any) => any;
}

const columns: ExcelColumn[] = [
  { header: 'Título', key: 'title', width: 30 },
  { header: 'Descrição', key: 'content', width: 50 },
  { header: 'Localização', key: 'location', width: 30 },
  { header: 'Latitude', key: 'latitude', width: 15 },
  { header: 'Longitude', key: 'longitude', width: 15 },
  { header: 'Peso', key: 'weight', width: 10 },
  {
    header: 'Tags',
    key: 'tags',
    width: 30,
    formatter: (tags: string[]) => tags?.join(', ') || ''
  },
  { header: 'Prioridade', key: 'ranking', width: 15 },
  {
    header: 'Data de Criação',
    key: 'createdAt',
    width: 20,
    formatter: (date: string) => new Date(date).toLocaleString('pt-BR')
  },
  { header: 'Autor', key: 'author.name', width: 25 },
  { header: 'Email do Autor', key: 'author.email', width: 30 },
  {
    header: 'Instituição',
    key: 'author.institution.title',
    width: 30,
    formatter: (value: any) => value || 'N/A'
  },
  { header: 'URL da Imagem', key: 'imageUrl', width: 50 }
];

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Format date for export
export const formatDateForExport = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export const exportToExcel = (interactions: Interaction[]): void => {
  // Transform data according to column specifications
  const data = interactions.map(interaction => {
    const row: any = {};
    columns.forEach(col => {
      const value = getNestedValue(interaction, col.key);
      row[col.header] = col.formatter ? col.formatter(value) : value;
    });
    return row;
  });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data, {
    header: columns.map(col => col.header)
  });

  // Set column widths
  const colWidths: any = {};
  columns.forEach((col, idx) => {
    const colLetter = XLSX.utils.encode_col(idx);
    colWidths[colLetter] = { width: col.width };
  });
  ws['!cols'] = Object.values(colWidths);

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Interações');

  // Generate filename with current date
  const date = new Date().toISOString().split('T')[0];
  const fileName = `interacoes_relatorio_${date}.xlsx`;

  // Save file
  XLSX.writeFile(wb, fileName);
};

