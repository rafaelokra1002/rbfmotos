import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Moto, Cliente, OrdemServico } from '../types';

// Função auxiliar para adicionar header moderno com logo em todos os PDFs
async function addModernHeader(
  doc: jsPDF, 
  titulo: string, 
  subtitulo?: string
): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Fundo preto no topo (mesma cor da logo)
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Faixa amarela de destaque
  doc.setFillColor(255, 193, 7);
  doc.rect(0, 45, pageWidth, 3, 'F');

  // Logo RBF Motos (lado esquerdo)
  let logoCarregada = false;
  try {
    const response = await fetch('/file.png');
    if (response.ok) {
      const blob = await response.blob();
      
      const imgData = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64 = reader.result as string;
          img.onload = () => resolve(base64);
          img.onerror = () => reject(new Error('Erro ao carregar imagem'));
          img.src = base64;
        };
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsDataURL(blob);
      });
      
      // Logo no canto esquerdo
      doc.addImage(imgData, 'PNG', 8, 5, 35, 35);
      logoCarregada = true;
    }
  } catch (error) {
    console.error('⚠️ Erro ao carregar logo:', error);
  }
  
  // Fallback se logo não carregar
  if (!logoCarregada) {
    doc.setFillColor(255, 193, 7);
    doc.roundedRect(8, 5, 35, 35, 3, 3, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RBF', 25.5, 20, { align: 'center' });
    doc.setFontSize(8);
    doc.text('MOTOS', 25.5, 28, { align: 'center' });
  }

  // Informações de contato em branco
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  
  // Linha 1: Telefone
  doc.text('71992724383', 48, 12);
  
  // Linha 2: Email
  doc.text('rbfmotos@hotmail.com', 48, 19);
  
  // Linha 3: Endereço
  doc.text('2ª Travessa do DERBA, 34, Camaçari de Dentro', 48, 26);
  
  // Linha 4: CNPJ
  doc.setFontSize(7.5);
  doc.setTextColor(200, 200, 200); // Cinza claro
  doc.text('CNPJ: 19516719000108', 48, 33);
  
  // Linha 5: Horário
  doc.text('Seg-Sex: 8h-18h  |  Sab: 8h-13h', 48, 39);

  // Título do documento no canto direito em amarelo
  doc.setTextColor(255, 193, 7);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, pageWidth - 10, 20, { align: 'right' });
  
  // Subtítulo em branco
  if (subtitulo) {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitulo, pageWidth - 10, 28, { align: 'right' });
  }

  return 55; // Retorna a posição Y após o header
}

export async function generateMotoHistoricoPDF(
  moto: Moto,
  cliente: Cliente,
  ordens: OrdemServico[]
): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header moderno
  let yPos = await addModernHeader(doc, 'HISTÓRICO DE MANUTENÇÃO', `${moto.marca} ${moto.modelo}`);
  yPos += 5;
  
  // Resetar cor do texto
  doc.setTextColor(0, 0, 0);
  
  // === Seção: Informações da Motocicleta ===
  doc.setFillColor(248, 250, 252); // bg-slate-50
  doc.roundedRect(15, yPos, pageWidth - 30, 35, 2, 2, 'F');
  
  yPos += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Informações da Motocicleta', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85); // slate-700
  
  // Linha 1: Proprietário e Telefone
  doc.setFont('helvetica', 'bold');
  doc.text('Proprietário:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(cliente.nome, 50, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Tel:', 120, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(cliente.telefone, 135, yPos);
  
  // Linha 2: Marca/Modelo
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Veículo:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${moto.marca} ${moto.modelo}`, 50, yPos);
  
  // Linha 3: Placa e Ano
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Placa:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(moto.placa, 50, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Ano:', 80, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(moto.ano.toString(), 95, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Cor:', 120, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(moto.cor, 135, yPos);
  
  if (moto.km) {
    doc.setFont('helvetica', 'bold');
    doc.text('KM:', 160, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(moto.km.toLocaleString('pt-BR'), 175, yPos);
  }
  
  // === Cards Estatísticos (estilo da página web) ===
  yPos += 15;
  
  const totalServicos = ordens.length;
  const valorTotal = ordens.reduce((sum, ordem) => sum + ordem.valorTotal, 0);
  const ultimaRevisao = ordens.find(o => o.status === 'entregue');
  const totalFotos = ordens.reduce((sum, ordem) => sum + (ordem.fotos?.length || 0), 0);
  
  const cardWidth = 45;
  const cardHeight = 28;
  const cardGap = 3;
  const cardStartX = 15;
  
  // Card 1: Total de Serviços (Amarelo)
  doc.setFillColor(254, 249, 195); // yellow-100
  doc.roundedRect(cardStartX, yPos, cardWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(250, 204, 21); // yellow-400
  doc.setLineWidth(0.5);
  doc.roundedRect(cardStartX, yPos, cardWidth, cardHeight, 2, 2, 'S');
  
  doc.setFontSize(8);
  doc.setTextColor(113, 63, 18); // yellow-900
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL DE SERVIÇOS', cardStartX + 3, yPos + 5);
  
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(totalServicos.toString(), cardStartX + 22, yPos + 18, { align: 'center' });
  
  // Card 2: Valor Total (Verde)
  const card2X = cardStartX + cardWidth + cardGap;
  doc.setFillColor(220, 252, 231); // green-100
  doc.roundedRect(card2X, yPos, cardWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(34, 197, 94); // green-500
  doc.roundedRect(card2X, yPos, cardWidth, cardHeight, 2, 2, 'S');
  
  doc.setFontSize(8);
  doc.setTextColor(20, 83, 45); // green-900
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR TOTAL', card2X + 3, yPos + 5);
  
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`R$ ${valorTotal.toFixed(2)}`, card2X + 22, yPos + 18, { align: 'center' });
  
  // Card 3: Última Revisão (Azul)
  const card3X = card2X + cardWidth + cardGap;
  doc.setFillColor(219, 234, 254); // blue-100
  doc.roundedRect(card3X, yPos, cardWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(59, 130, 246); // blue-500
  doc.roundedRect(card3X, yPos, cardWidth, cardHeight, 2, 2, 'S');
  
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138); // blue-900
  doc.setFont('helvetica', 'bold');
  doc.text('ÚLTIMA REVISÃO', card3X + 3, yPos + 5);
  
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(
    ultimaRevisao 
      ? new Date(ultimaRevisao.dataAbertura).toLocaleDateString('pt-BR')
      : 'Nenhuma',
    card3X + 22, 
    yPos + 18, 
    { align: 'center' }
  );
  
  // Card 4: Fotos (Roxo)
  const card4X = card3X + cardWidth + cardGap;
  doc.setFillColor(237, 233, 254); // purple-100
  doc.roundedRect(card4X, yPos, cardWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(168, 85, 247); // purple-500
  doc.roundedRect(card4X, yPos, cardWidth, cardHeight, 2, 2, 'S');
  
  doc.setFontSize(8);
  doc.setTextColor(76, 29, 149); // purple-900
  doc.setFont('helvetica', 'bold');
  doc.text('FOTOS', card4X + 3, yPos + 5);
  
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(totalFotos.toString(), card4X + 22, yPos + 18, { align: 'center' });
  
  // === Histórico de Serviços ===
  yPos += cardHeight + 15;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Histórico de Serviços', 15, yPos);
  
  yPos += 8;
  
  // Tabela de Ordens com estilo profissional
  const tableData = ordens.map(ordem => {
    // Traduzir status
    const statusMap: Record<string, string> = {
      'aberta': 'Aberta',
      'em_andamento': 'Em Andamento',
      'aguardando_peca': 'Aguardando Peça',
      'pronta': 'Pronta',
      'entregue': 'Entregue',
      'cancelada': 'Cancelada'
    };
    
    return [
      ordem.numero,
      new Date(ordem.dataAbertura).toLocaleDateString('pt-BR'),
      statusMap[ordem.status] || ordem.status,
      ordem.itens.length.toString(),
      `R$ ${ordem.valorTotal.toFixed(2)}`
    ];
  });
  
  autoTable(doc, {
    startY: yPos,
    head: [['Ordem', 'Data', 'Status', 'Itens', 'Valor']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: { 
      fontSize: 9,
      cellPadding: 3,
      lineColor: [226, 232, 240], // slate-200
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // slate-50
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
    }
  });
  
  // Detalhes de cada ordem com estilo card
  let currentY = (doc as any).lastAutoTable.finalY + 15;
  
  for (let i = 0; i < ordens.length; i++) {
    const ordem = ordens[i];
    
    // Verificar se precisa de nova página
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }
    
    // Card de ordem com borda colorida
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(15, currentY - 3, pageWidth - 30, 10, 2, 2, 'F');
    
    // Borda esquerda colorida (amarela)
    doc.setFillColor(251, 191, 36); // amber-400
    doc.rect(15, currentY - 3, 2, 10, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(`OS ${ordem.numero}`, 22, currentY + 4);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(new Date(ordem.dataAbertura).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    }), pageWidth - 20, currentY + 4, { align: 'right' });
    
    currentY += 12;
    
    // Problema
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('PROBLEMA RELATADO:', 20, currentY);
    
    currentY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85); // slate-700
    const problemaLines = doc.splitTextToSize(ordem.descricaoProblema, pageWidth - 40);
    doc.text(problemaLines, 20, currentY);
    currentY += problemaLines.length * 4;
    
    // Diagnóstico (se houver)
    if (ordem.diagnostico) {
      currentY += 3;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('DIAGNÓSTICO:', 20, currentY);
      
      currentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const diagnosticoLines = doc.splitTextToSize(ordem.diagnostico, pageWidth - 40);
      doc.text(diagnosticoLines, 20, currentY);
      currentY += diagnosticoLines.length * 4;
    }
    
    // Tabela de Itens
    currentY += 3;
    const itensData = ordem.itens.map(item => [
      `${item.quantidade}x`,
      item.nome,
      `R$ ${item.precoUnitario.toFixed(2)}`,
      `R$ ${(item.quantidade * item.precoUnitario - (item.desconto || 0)).toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [['Qtd', 'Item/Serviço', 'Valor Unit.', 'Total']],
      body: itensData,
      theme: 'plain',
      headStyles: {
        fillColor: [241, 245, 249], // slate-100
        textColor: [51, 65, 85], // slate-700
        fontSize: 8,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 8, 
        cellPadding: 2,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 100 },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 20, right: 20 }
    });
    
    currentY = (doc as any).lastAutoTable.finalY;
    
    // Total da ordem (destacado)
    currentY += 2;
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(pageWidth - 80, currentY, 60, 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL:', pageWidth - 75, currentY + 5);
    doc.text(`R$ ${ordem.valorTotal.toFixed(2)}`, pageWidth - 25, currentY + 5, { align: 'right' });
    
    currentY += 8;
    
    // Fotos
    if (ordem.fotos && ordem.fotos.length > 0) {
      currentY += 5;
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(`FOTOS (${ordem.fotos.length}):`, 20, currentY);
      
      currentY += 5;
      let xPos = 20;
      const imgWidth = 42;
      const imgHeight = 32;
      let fotosNaLinha = 0;
      const maxFotosPorLinha = 4;
      
      for (let i = 0; i < ordem.fotos.length; i++) {
        try {
          const fotoUrl = ordem.fotos[i];
          
          // Pular se não há URL válida
          if (!fotoUrl || typeof fotoUrl !== 'string') {
            console.warn(`Foto ${i + 1} inválida:`, fotoUrl);
            continue;
          }
          
          // Verificar se precisa de nova página
          if (currentY + imgHeight + 10 > 280) {
            doc.addPage();
            currentY = 20;
            xPos = 20;
            fotosNaLinha = 0;
          }
          
          // Carregar e validar a imagem antes de adicionar ao PDF
          const imgData = await new Promise<string>((resolve, reject) => {
            const img = new Image();
            
            // Configurar crossOrigin para mobile
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
              try {
                // Criar canvas para converter a imagem
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  reject(new Error('Não foi possível criar contexto do canvas'));
                  return;
                }
                
                // Desenhar imagem no canvas
                ctx.drawImage(img, 0, 0);
                
                // Converter para base64 (JPEG para melhor compressão)
                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                resolve(base64);
              } catch (error) {
                reject(error);
              }
            };
            
            img.onerror = (error) => {
              console.error('Erro ao carregar foto:', error);
              reject(new Error(`Erro ao carregar foto ${i + 1}`));
            };
            
            // Carregar a imagem
            img.src = fotoUrl;
          });
          
          // Borda da foto (card)
          doc.setDrawColor(226, 232, 240); // slate-200
          doc.setLineWidth(0.5);
          doc.roundedRect(xPos - 1, currentY - 1, imgWidth + 2, imgHeight + 2, 1, 1, 'S');
          
          // Adicionar a foto processada
          doc.addImage(imgData, 'JPEG', xPos, currentY, imgWidth, imgHeight);
          
          xPos += imgWidth + 4;
          fotosNaLinha++;
          
          // Quebrar linha se atingiu o máximo de fotos por linha
          if (fotosNaLinha >= maxFotosPorLinha) {
            xPos = 20;
            currentY += imgHeight + 4;
            fotosNaLinha = 0;
          }
        } catch (error) {
          console.error(`Erro ao adicionar foto ${i + 1} ao PDF:`, error);
          // Continuar com as próximas fotos mesmo se uma falhar
        }
      }
      
      // Ajustar posição Y se ainda há fotos na última linha
      if (fotosNaLinha > 0) {
        currentY += imgHeight + 4;
      }
    }
    
    // Linha separadora entre ordens (exceto a última)
    if (i < ordens.length - 1) {
      currentY += 8;
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(15, currentY, pageWidth - 15, currentY);
      currentY += 10;
    }
  }
  
  // Rodapé em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Página ${i} de ${totalPages} • Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    
    // Logo/marca no rodapé
    doc.setTextColor(203, 213, 225); // slate-300
    doc.setFontSize(7);
    doc.text('RBF Motos - Sua oficina de confiança', pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
  }
  
  // Retornar como Blob
  return doc.output('blob');
}

export async function generateOrcamentoPDF(
  orcamento: any,
  cliente: Cliente,
  moto: Moto
): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header moderno
  let yPos = await addModernHeader(doc, 'ORÇAMENTO', `Nº ${orcamento.numero}`);
  yPos += 10;

  // Resetar cor do texto
  doc.setTextColor(0, 0, 0);
  
  // Dados do Cliente e Moto
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', 15, yPos);
  
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${cliente.nome}`, 15, yPos);
  
  yPos += 5;
  doc.text(`Telefone: ${cliente.telefone}`, 15, yPos);
  if (cliente.email) {
    doc.text(`Email: ${cliente.email}`, 110, yPos);
  }
  
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DA MOTOCICLETA', 15, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`${moto.marca} ${moto.modelo} - ${moto.ano}`, 15, yPos);
  doc.text(`Placa: ${moto.placa}`, 110, yPos);
  
  // Tabela de Itens
  yPos += 10;
  const tableData = orcamento.itens.map((item: any) => [
    item.quantidade,
    item.nome,
    item.tipo === 'servico' ? 'Serviço' : 'Peça',
    `R$ ${item.precoUnitario.toFixed(2)}`,
    item.desconto ? `${item.desconto}%` : '-',
    `R$ ${(item.quantidade * item.precoUnitario * (1 - (item.desconto || 0) / 100)).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Qtd', 'Descrição', 'Tipo', 'Valor Unit.', 'Desc.', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [255, 193, 7],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 30, halign: 'right' }
    }
  });

  // Total
  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('VALOR TOTAL:', pageWidth - 55, yPos);
  doc.text(`R$ ${orcamento.valorTotal.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });

  // Observações
  if (orcamento.observacoes) {
    yPos += 10;
    doc.setFontSize(10);
    doc.text('Observações:', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const obsLines = doc.splitTextToSize(orcamento.observacoes, pageWidth - 30);
    doc.text(obsLines, 15, yPos);
  }

  // Rodapé
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  return doc.output('blob');
}

export async function generateOrdemServicoPDF(
  ordem: any,
  cliente: Cliente,
  moto: Moto
): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header moderno
  const statusLabels: any = {
    aberta: 'Em Aberto',
    em_andamento: 'Em Andamento',
    pronta: 'Pronta para Entrega',
    entregue: 'Concluída'
  };
  
  let yPos = await addModernHeader(
    doc, 
    'ORDEM DE SERVIÇO',
    `OS-${ordem.numero} - ${statusLabels[ordem.status] || ordem.status}`
  );
  yPos += 10;

  // Resetar cor do texto
  doc.setTextColor(0, 0, 0);
  
  // Dados do Cliente
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', 15, yPos);
  
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${cliente.nome}`, 15, yPos);
  doc.text(`Telefone: ${cliente.telefone}`, 110, yPos);
  
  // Dados da Moto
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DA MOTOCICLETA', 15, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`${moto.marca} ${moto.modelo} - ${moto.ano}`, 15, yPos);
  doc.text(`Placa: ${moto.placa}`, 110, yPos);
  
  // Descrição do Problema
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIÇÃO DO PROBLEMA', 15, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  const descLines = doc.splitTextToSize(ordem.descricaoProblema, pageWidth - 30);
  doc.text(descLines, 15, yPos);
  yPos += descLines.length * 5 + 5;

  // Itens da OS
  if (ordem.servicos && ordem.servicos.length > 0) {
    const tableData = ordem.servicos.map((item: any) => [
      item.quantidade || 1,
      item.nome,
      item.tipo === 'servico' ? 'Serviço' : 'Peça',
      `R$ ${(item.precoUnitario || item.preco || 0).toFixed(2)}`,
      `R$ ${((item.quantidade || 1) * (item.precoUnitario || item.preco || 0)).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Qtd', 'Descrição', 'Tipo', 'Valor Unit.', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [255, 193, 7],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 85 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Valor Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('VALOR TOTAL:', pageWidth - 65, yPos);
  doc.text(`R$ ${ordem.valorTotal.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });

  // Observações
  if (ordem.observacoes) {
    yPos += 10;
    doc.setFontSize(10);
    doc.text('OBSERVAÇÕES:', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const obsLines = doc.splitTextToSize(ordem.observacoes, pageWidth - 30);
    doc.text(obsLines, 15, yPos);
  }

  // Rodapé
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  return doc.output('blob');
}
