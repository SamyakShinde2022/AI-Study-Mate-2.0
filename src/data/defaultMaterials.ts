import { StudyMaterial, StudyTask } from '../types/index.ts';

export const DEFAULT_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-1',
    title: 'Data Structures & Algorithms: Recursion & Trees',
    subject: 'Computer Science',
    sourceType: 'preset',
    dateAdded: 'Oct 3, 2026',
    wordCount: 380,
    readingMinutes: 2,
    tags: ['Recursion', 'Binary Trees', 'Time Complexity'],
    content: `Recursion & Binary Search Trees Guide:

1. Recursion Fundamentals:
Recursion is a programming technique where a function solves a problem by calling a smaller instance of itself.
Every recursive function requires:
- Base Case: A condition that stops recursion and returns a direct value without further self-calls (preventing stack overflow).
- Recursive Step: Modifying parameters to move closer to the base case while delegating subproblems.
Memory Execution: Each recursive call allocates a frame on the call stack ($O(N)$ auxiliary space for depth $N$).

2. Binary Search Trees (BST):
A rooted binary tree with the BST invariant:
- For any node $X$, all keys in the left subtree are strictly less than $X.key$.
- All keys in the right subtree are strictly greater than $X.key$.
- Both left and right subtrees must also be binary search trees.

Operations:
- Search / Insert / Delete: Average time complexity is $O(\\log N)$. Worst case is $O(N)$ when the tree degenerates into a linear linked list (mitigated by balanced trees like AVL or Red-Black trees).
- In-Order Traversal (Left, Root, Right): Traverses the keys in ascending sorted order.`,
  },
  {
    id: 'mat-2',
    title: 'Classical Mechanics & Newton’s Laws of Motion',
    subject: 'Physics',
    sourceType: 'preset',
    dateAdded: 'Oct 4, 2026',
    wordCount: 340,
    readingMinutes: 2,
    tags: ['Mechanics', 'Forces', 'Kinematics'],
    content: `Classical Mechanics & Newton’s Laws of Motion:

1. Newton's First Law (Law of Inertia):
An object remains at rest or in uniform motion in a straight line unless acted upon by a net external force. Inertia is quantified by inertial mass.

2. Newton's Second Law:
The rate of change of momentum is directly proportional to the applied net force. In constant mass systems:
$$\\vec{F}_{net} = m \\vec{a} = \\frac{d\\vec{p}}{dt}$$
Where $\\vec{F}$ is force in Newtons, $m$ is mass in kilograms, and $\\vec{a}$ is acceleration in $m/s^2$.

3. Newton's Third Law (Action-Reaction):
When body A exerts a force on body B, body B simultaneously exerts an equal in magnitude and opposite in direction force on body A:
$$\\vec{F}_{A \\to B} = -\\vec{F}_{B \\to A}$$
Action and reaction forces never cancel each other out because they act on two distinct physical bodies.

4. Work-Energy Theorem:
Net work done by all forces equals the change in kinetic energy ($W_{net} = \\Delta KE = \\frac{1}{2} m v_f^2 - \\frac{1}{2} m v_i^2$).`,
  },
  {
    id: 'mat-3',
    title: 'Computer Networks: OSI Model & Protocols',
    subject: 'Computer Science',
    sourceType: 'preset',
    dateAdded: 'Oct 5, 2026',
    wordCount: 360,
    readingMinutes: 2,
    tags: ['Networking', 'OSI Layers', 'TCP/IP'],
    content: `Open Systems Interconnection (OSI) 7-Layer Reference Model:

1. Physical Layer: Transmission of raw unstructured bit streams over physical media (cables, fiber, RF).
2. Data Link Layer: Reliable node-to-node framing, MAC addressing, error detection (CRC). Protocols: Ethernet (IEEE 802.3), Wi-Fi (802.11).
3. Network Layer: Logical addressing and routing of packets across internetworks. Protocols: IPv4, IPv6, ICMP, BGP, OSPF.
4. Transport Layer: End-to-end communication, segmentation, flow and error control.
   - TCP: Connection-oriented, 3-way handshake (SYN, SYN-ACK, ACK), reliable ordered delivery, congestion control.
   - UDP: Connectionless, lightweight, low-latency, no acknowledgment (used for streaming, DNS, gaming).
5. Session Layer: Establishes, manages, and terminates presentation sessions.
6. Presentation Layer: Syntax translation, data encryption (TLS/SSL), compression.
7. Application Layer: Human-computer interaction and network services. Protocols: HTTP/HTTPS, DNS, SMTP, SSH.`,
  },
];

export const DEFAULT_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    title: 'Solve 3 Tree Traversal Practice Problems',
    subject: 'Computer Science',
    duration: '45 min',
    priority: 'high',
    completed: false,
    category: 'Practice',
  },
  {
    id: 'task-2',
    title: 'Review Physics Flashcards: Newton’s Laws',
    subject: 'Physics',
    duration: '20 min',
    priority: 'medium',
    completed: true,
    category: 'Review',
  },
  {
    id: 'task-3',
    title: 'Complete 5-Question Quiz on Networking Layers',
    subject: 'Computer Science',
    duration: '15 min',
    priority: 'medium',
    completed: false,
    category: 'Quiz',
  },
  {
    id: 'task-4',
    title: 'Read Module 3 on Differential Equations',
    subject: 'Mathematics',
    duration: '30 min',
    priority: 'low',
    completed: false,
    category: 'Reading',
  },
];
