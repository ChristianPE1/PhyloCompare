from app.aligner import needleman_wunsch
from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord
from Bio.Align import MultipleSeqAlignment
from Bio import AlignIO, SeqIO
import os

def align_multiple(sequences):
    """Alineamiento múltiple usando alineamiento por pares progresivo"""
    aligned = {}
    names = list(sequences.keys())
    center_name = names[0]
    center_seq = sequences[center_name]
    aligned[center_name] = center_seq

    for name in names[1:]:
        s2 = sequences[name]
        aln1, aln2, _ = needleman_wunsch(center_seq, s2)
        center_seq = aln1
        aligned[center_name] = aln1
        aligned[name] = aln2

    maxlen = max(len(s) for s in aligned.values())
    for name in aligned:
        aligned[name] = aligned[name].ljust(maxlen, '-')

    # Crear carpeta si no existe
    os.makedirs("results", exist_ok=True)

    # Guardar alineamiento como archivo FASTA
    alignment = MultipleSeqAlignment([
        SeqRecord(Seq(seq), id=name)
        for name, seq in aligned.items()
    ])
    AlignIO.write(alignment, "results/alineado.fasta", "fasta")

    return aligned

def align_multiple_sequences(input_fasta_path, output_fasta_path):
    """
    Realizar alineamiento múltiple de secuencias desde un archivo FASTA
    y guardar el resultado en otro archivo FASTA
    """
    try:
        # Leer secuencias del archivo FASTA
        sequences = {}
        records = SeqIO.parse(input_fasta_path, 'fasta')
        for record in records:
            sequences[record.id] = str(record.seq)
        
        if len(sequences) < 2:
            raise ValueError("Se requieren al menos 2 secuencias para alineamiento")
        
        # Realizar alineamiento múltiple progresivo
        aligned_sequences = {}
        sequence_names = list(sequences.keys())
        
        # Comenzar con la primera secuencia como referencia
        reference_name = sequence_names[0]
        reference_seq = sequences[reference_name]
        aligned_sequences[reference_name] = reference_seq
        
        # Alinear cada secuencia restante con la referencia
        for seq_name in sequence_names[1:]:
            target_seq = sequences[seq_name]
            
            # Realizar alineamiento por pares
            aligned_ref, aligned_target, _ = needleman_wunsch(reference_seq, target_seq)
            
            # Actualizar secuencia de referencia
            reference_seq = aligned_ref
            aligned_sequences[reference_name] = aligned_ref
            aligned_sequences[seq_name] = aligned_target
        
        # Igualar todas las secuencias a la misma longitud
        max_length = max(len(seq) for seq in aligned_sequences.values())
        for name in aligned_sequences:
            aligned_sequences[name] = aligned_sequences[name].ljust(max_length, '-')
        
        # Crear objeto MultipleSeqAlignment de Biopython
        alignment_records = []
        for name, seq in aligned_sequences.items():
            record = SeqRecord(Seq(seq), id=name, description="")
            alignment_records.append(record)
        
        alignment = MultipleSeqAlignment(alignment_records)
        
        # Crear directorio de salida si no existe
        os.makedirs(os.path.dirname(output_fasta_path), exist_ok=True)
        
        # Guardar alineamiento en archivo FASTA
        AlignIO.write(alignment, output_fasta_path, "fasta")
        
        return True
        
    except Exception as e:
        raise Exception(f"Error en alineamiento múltiple: {str(e)}")
