export interface SampleTopic {
  id: string;
  name: string;
  subject: string;
  category: string;
  description: string;
  sampleNotes: string;
  sampleSyllabus: string;
}

export const SAMPLE_TOPICS: SampleTopic[] = [
  {
    id: 'cs-algo',
    name: 'Dynamic Programming & Graph Algorithms',
    subject: 'Computer Science',
    category: 'Engineering & Tech',
    description: 'Bellman-Ford, Dijkstra, memoization vs tabulation, state transitions and optimal substructure.',
    sampleNotes: `Dynamic Programming (DP) is an algorithmic paradigm that solves complex problems by breaking them into overlapping subproblems and storing intermediate results to avoid redundant computation.

Key Principles:
1. Optimal Substructure: An optimal solution to the problem contains optimal solutions to its subproblems.
2. Overlapping Subproblems: The same subproblems are solved repeatedly (unlike divide-and-conquer where subproblems are independent).

Techniques:
- Top-Down with Memoization: Recursion augmented with a cache (hash map or table). On each function call, check if the state is already computed.
- Bottom-Up Tabulation: Iterative table-filling starting from the base cases up to the desired target state. Eliminates recursion call stack overhead.

Graph Algorithms:
- Dijkstra's Algorithm: Greedy shortest path for directed/undirected graphs with non-negative edge weights using a min-heap priority queue ($O((V + E) \\log V)$).
- Bellman-Ford: Dynamic programming shortest path from single source, handles negative edge weights, detects negative cycles ($O(V \\cdot E)$).
- Floyd-Warshall: All-pairs shortest path dynamic programming ($O(V^3)$), works with negative edges as long as no negative cycle exists.

Common Exam Traps:
- Applying Dijkstra's to graphs with negative edges causes incorrect paths because greedy vertex finalization assumes weights can never decrease.
- Forgetting to identify the base cases or state transition dimensions in 2D DP (e.g. Knapsack, Longest Common Subsequence).`,
    sampleSyllabus: `Module 1: Asymptotic Analysis & Recurrences
Module 2: Greedy Choice Property vs Dynamic Programming
Module 3: 0/1 Knapsack, Unbounded Knapsack, and Subset Sum
Module 4: Longest Common Subsequence (LCS) & Edit Distance
Module 5: Shortest Path in Graphs: Dijkstra, Bellman-Ford, Floyd-Warshall
Module 6: Minimum Spanning Trees (Kruskal & Prim with Disjoint-Set Union)`,
  },
  {
    id: 'bio-dna',
    name: 'Molecular Genetics & CRISPR-Cas9',
    subject: 'Biology & Medicine',
    category: 'Life Sciences',
    description: 'Central dogma, DNA replication forks, transcription regulation, and Cas9 endonuclease editing.',
    sampleNotes: `Molecular Genetics & Gene Editing:

Central Dogma:
Genetic information flows from DNA -> RNA -> Protein.
- Transcription: RNA Polymerase II synthesizes pre-mRNA from the antisense template strand (5' to 3' synthesis).
- Post-Transcriptional Processing: 5' 7-methylguanosine cap, 3' poly-A tail, and spliceosomal removal of introns (alternative splicing allows protein diversity).
- Translation: Ribosomes (70S in prokaryotes, 80S in eukaryotes) decode codons via aminoacyl-tRNAs in A, P, E sites.

CRISPR-Cas9 Mechanism:
CRISPR (Clustered Regularly Interspaced Short Palindromic Repeats) is an adaptive bacterial defense mechanism repurposed for targeted genome engineering.
Components:
1. Cas9 Nuclease: Endonuclease enzyme responsible for introducing a double-strand break (DSB).
2. Guide RNA (sgRNA): Consists of crRNA (targeting ~20 nucleotide sequence) and tracrRNA (structural scaffold).
3. PAM (Protospacer Adjacent Motif): 5'-NGG-3' sequence required downstream of the target site for Cas9 binding and unwinding.

Repair Pathways after DSB:
- NHEJ (Non-Homologous End Joining): Error-prone, frequently creates insertions or deletions (indels) causing frameshift knockouts.
- HDR (Homology-Directed Repair): High-fidelity templated repair in the presence of an exogenous donor DNA template for precise knock-ins.`,
    sampleSyllabus: `Unit 1: Nucleic Acid Structure & Semiconservative Replication
Unit 2: Transcription Initiation, Elongation, and Termination
Unit 3: Spliceosome Mechanics & Epigenetic Histone Modifications
Unit 4: Translation & Ribosomal Peptidyl Transferase Kinetics
Unit 5: CRISPR-Cas9, Base Editing, and Prime Editing Tools
Unit 6: Ethical and Clinical Gene Therapy Applications`,
  },
  {
    id: 'phys-thermo',
    name: 'Thermodynamics & Statistical Mechanics',
    subject: 'Physics',
    category: 'Physical Sciences',
    description: 'Carnot cycles, entropy definition, Maxwell-Boltzmann distributions, and free energy.',
    sampleNotes: `Thermodynamics Laws:
- Zeroth Law: Defines thermal equilibrium and temperature transitivity. If system A is in thermal equilibrium with B, and B with C, then A is in equilibrium with C.
- First Law: Conservation of Energy ($dU = dQ - dW$). The change in internal energy equals heat added minus work done by the system.
- Second Law: The total entropy of an isolated system never decreases over time ($\\Delta S \\ge 0$). Heat cannot spontaneously flow from a colder to a hotter reservoir without external work (Clausius Statement).
- Third Law: As temperature approaches absolute zero ($T \\to 0$ K), the entropy of a pure crystalline substance approaches zero ($S \\to 0$).

Carnot Cycle:
The most efficient hypothetical heat engine operating between two temperatures $T_H$ and $T_C$.
Efficiency: $\\eta = 1 - \\frac{T_C}{T_H}$.
Four reversible processes:
1. Isothermal expansion at $T_H$
2. Adiabatic expansion (no heat transfer, temperature drops to $T_C$)
3. Isothermal compression at $T_C$ (heat rejected)
4. Adiabatic compression (temperature rises back to $T_H$)

Statistical Mechanics:
Boltzmann Entropy Formula: $S = k_B \\ln \\Omega$, where $\\Omega$ is the number of accessible microstates corresponding to the macrostate.
Helmholtz Free Energy: $F = U - TS$, minimized at constant temperature and volume.
Gibbs Free Energy: $G = H - TS$, minimized at constant temperature and pressure.`,
    sampleSyllabus: `Topic 1: State Variables, Ideal Gas Law, van der Waals Equation
Topic 2: First Law: Enthalpy, Heat Capacity ($C_v$, $C_p$), and Work in Reversible Processes
Topic 3: Second Law: Heat Engines, Carnot Efficiency, Clausius Inequality
Topic 4: Entropy Calculations for Ideal Gases & Phase Transitions
Topic 5: Thermodynamic Potentials: Helmholtz and Gibbs Free Energy
Topic 6: Maxwell Relations & Chemical Potential`,
  },
  {
    id: 'econ-macro',
    name: 'Macroeconomics & Monetary Policy',
    subject: 'Economics & Finance',
    category: 'Social Sciences',
    description: 'IS-LM framework, central bank open market operations, inflation targeting, and fiscal policy multipliers.',
    sampleNotes: `Macroeconomic Equilibrium and Central Banking:

IS-LM Framework:
- IS (Investment-Saving) Curve: Represents equilibrium in the goods market. Higher interest rates reduce investment and output, giving a downward sloping curve.
- LM (Liquidity preference-Money supply) Curve: Represents equilibrium in the money market. Higher output increases transaction demand for money, raising interest rates for a fixed real money supply.

Central Bank Policy Instruments:
1. Policy Interest Rate (Federal Funds Rate / Repo Rate): The benchmark rate at which commercial banks borrow short-term funds.
2. Open Market Operations (OMO): Buying government bonds injects reserves into the banking system (expansionary), while selling bonds absorbs liquidity (contractionary).
3. Reserve Requirements: The fraction of deposits banks must keep on reserve.
4. Quantitative Easing (QE): Large-scale purchases of longer-term securities to lower long-term borrowing costs when policy rates reach the zero lower bound.

Inflation & The Phillips Curve:
- Short-Run Phillips Curve (SRPC): Shows an inverse trade-off between inflation and unemployment.
- Long-Run Phillips Curve (LRPC): Vertical at the Natural Rate of Unemployment (NAIRU), reflecting monetary neutrality in the long run.

Taylor Rule:
$i_t = r^* + \\pi_t + 0.5(\\pi_t - \\pi^*) + 0.5(y_t - y^*)$
Prescribes how the central bank should adjust nominal interest rates in response to inflation gaps and output gaps.`,
    sampleSyllabus: `Section 1: GDP Measurement, Deflator vs CPI, Inflation Metrics
Section 2: Aggregate Demand & Aggregate Supply (AD-AS Model)
Section 3: Fiscal Policy Multipliers & Sovereign Debt Dynamics
Section 4: Money Creation, Fractional Banking & Central Bank Balance Sheets
Section 5: Monetary Transmission Mechanism & Unconventional Policies
Section 6: Exchange Rate Regimes, Covered Interest Parity & Balance of Payments`,
  },
];
