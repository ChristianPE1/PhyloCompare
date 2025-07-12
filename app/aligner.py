def needleman_wunsch(seq1, seq2, match=1, mismatch=-1, gap=-2):
    n, m = len(seq1), len(seq2)
    score = [[0]*(m+1) for _ in range(n+1)]
    trace = [['']*(m+1) for _ in range(n+1)]

    for i in range(n+1):
        score[i][0] = i * gap
        trace[i][0] = 'U'
    for j in range(m+1):
        score[0][j] = j * gap
        trace[0][j] = 'L'
    trace[0][0] = '0'

    for i in range(1, n+1):
        for j in range(1, m+1):
            diag = score[i-1][j-1] + (match if seq1[i-1]==seq2[j-1] else mismatch)
            up = score[i-1][j] + gap
            left = score[i][j-1] + gap
            best = max(diag, up, left)
            score[i][j] = best
            trace[i][j] = 'D' if best==diag else 'U' if best==up else 'L'

    aln1, aln2 = "", ""
    i, j = n, m
    while i > 0 or j > 0:
        if trace[i][j] == 'D':
            aln1 = seq1[i-1] + aln1
            aln2 = seq2[j-1] + aln2
            i -= 1
            j -= 1
        elif trace[i][j] == 'U':
            aln1 = seq1[i-1] + aln1
            aln2 = '-' + aln2
            i -= 1
        elif trace[i][j] == 'L':
            aln1 = '-' + aln1
            aln2 = seq2[j-1] + aln2
            j -= 1

    return aln1, aln2, score[n][m]
