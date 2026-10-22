// Cortex Quest - Computer Networks Questions
// window.QuestionsNetworks

window.QuestionsNetworks = [
  {
    id: 'net-1',
    text: 'How many layers are in the OSI model?',
    options: ['4', '5', '6', '7'],
    correct: 3,
    explanation: 'The OSI (Open Systems Interconnection) model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application.',
    difficulty: 'easy',
    hint: 'Remember the mnemonic: "Please Do Not Throw Sausage Pizza Away".'
  },
  {
    id: 'net-2',
    text: 'Which layer of the OSI model is responsible for routing packets between networks?',
    options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Session Layer'],
    correct: 1,
    explanation: 'The Network Layer (Layer 3) is responsible for routing packets from source to destination across multiple networks. Routers operate at this layer using IP addresses.',
    difficulty: 'easy',
    hint: 'Routers operate at this layer.'
  },
  {
    id: 'net-3',
    text: 'What is the default port number for HTTP?',
    options: ['21', '25', '80', '443'],
    correct: 2,
    explanation: 'HTTP (HyperText Transfer Protocol) uses port 80 by default. HTTPS (secure HTTP) uses port 443. FTP uses port 21, and SMTP uses port 25.',
    difficulty: 'easy',
    hint: 'HTTPS uses 443; HTTP uses a lower number.'
  },
  {
    id: 'net-4',
    text: 'What does DNS stand for?',
    options: ['Dynamic Network System', 'Domain Name System', 'Data Network Service', 'Domain Node Server'],
    correct: 1,
    explanation: 'DNS stands for Domain Name System. It translates human-readable domain names (like www.google.com) into IP addresses that computers can understand.',
    difficulty: 'easy',
    hint: 'It is like a phone book for the internet.'
  },
  {
    id: 'net-5',
    text: 'Which protocol is connection-oriented and provides reliable data delivery?',
    options: ['UDP', 'IP', 'TCP', 'ICMP'],
    correct: 2,
    explanation: 'TCP (Transmission Control Protocol) is connection-oriented. It establishes a connection using a three-way handshake and guarantees reliable, ordered delivery of data.',
    difficulty: 'easy',
    hint: 'It uses a three-way handshake.'
  },
  {
    id: 'net-6',
    text: 'What is the subnet mask for a Class C network?',
    options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255'],
    correct: 2,
    explanation: 'A Class C network uses a subnet mask of 255.255.255.0 (/24). Class A uses 255.0.0.0 (/8), and Class B uses 255.255.0.0 (/16).',
    difficulty: 'medium',
    hint: 'Class C addresses use the first three octets for the network.'
  },
  {
    id: 'net-7',
    text: 'At which OSI layer do switches primarily operate?',
    options: ['Physical Layer', 'Data Link Layer', 'Network Layer', 'Transport Layer'],
    correct: 1,
    explanation: 'Switches primarily operate at the Data Link Layer (Layer 2), using MAC addresses to forward frames within a local area network. Routers operate at Layer 3.',
    difficulty: 'medium',
    hint: 'Switches use MAC addresses.'
  },
  {
    id: 'net-8',
    text: 'What does DHCP stand for and what is its purpose?',
    options: ['Dynamic Host Configuration Protocol — automatically assigns IP addresses', 'Domain Host Control Protocol — manages domain names', 'Data Host Control Protocol — controls data flow', 'Dynamic Host Control Procedure — configures DNS'],
    correct: 0,
    explanation: 'DHCP (Dynamic Host Configuration Protocol) automatically assigns IP addresses, subnet masks, default gateways, and DNS server addresses to devices on a network.',
    difficulty: 'medium',
    hint: 'It automatically configures network settings for devices.'
  },
  {
    id: 'net-9',
    text: 'How many bits are in an IPv4 address?',
    options: ['16', '32', '64', '128'],
    correct: 1,
    explanation: 'An IPv4 address is 32 bits long, written as four octets (e.g., 192.168.1.1). IPv6 addresses are 128 bits long.',
    difficulty: 'easy',
    hint: 'IPv4 is written as four groups of numbers separated by dots.'
  },
  {
    id: 'net-10',
    text: 'What is the purpose of ARP (Address Resolution Protocol)?',
    options: ['Resolves domain names to IP addresses', 'Resolves IP addresses to MAC addresses', 'Routes packets between networks', 'Assigns IP addresses dynamically'],
    correct: 1,
    explanation: 'ARP (Address Resolution Protocol) maps an IP address to a physical MAC address on a local network. It is used when a device knows the IP address of the destination but needs the MAC address.',
    difficulty: 'medium',
    hint: 'It helps find the physical address from the logical address.'
  },
  {
    id: 'net-11',
    text: 'Which routing protocol uses the Dijkstra algorithm?',
    options: ['RIP', 'OSPF', 'BGP', 'EIGRP'],
    correct: 1,
    explanation: 'OSPF (Open Shortest Path First) is a link-state routing protocol that uses Dijkstra\'s Shortest Path First algorithm to calculate the best routes through a network.',
    difficulty: 'hard',
    hint: 'It is a link-state protocol that builds a complete network topology map.'
  },
  {
    id: 'net-12',
    text: 'What is the three-way handshake in TCP?',
    options: ['SYN, ACK, FIN', 'SYN, SYN-ACK, ACK', 'ACK, SYN, FIN', 'INIT, CONNECT, CONFIRM'],
    correct: 1,
    explanation: 'The TCP three-way handshake establishes a connection: (1) Client sends SYN, (2) Server responds with SYN-ACK, (3) Client sends ACK. The connection is then established.',
    difficulty: 'medium',
    hint: 'It uses three messages to establish a reliable connection.'
  },
  {
    id: 'net-13',
    text: 'What type of network covers a small geographical area like a single building or campus?',
    options: ['WAN', 'MAN', 'LAN', 'PAN'],
    correct: 2,
    explanation: 'LAN (Local Area Network) covers a small geographical area such as an office, building, or campus. WAN covers large areas (like the internet), and MAN covers a metropolitan area.',
    difficulty: 'easy',
    hint: 'It is the smallest type of area network listed.'
  },
  {
    id: 'net-14',
    text: 'Which protocol is used to send email?',
    options: ['HTTP', 'FTP', 'SMTP', 'POP3'],
    correct: 2,
    explanation: 'SMTP (Simple Mail Transfer Protocol) is used to send emails from a client to a mail server and between mail servers. POP3 and IMAP are used to retrieve emails.',
    difficulty: 'easy',
    hint: 'It is for sending, not receiving, email.'
  },
  {
    id: 'net-15',
    text: 'What is a VLAN?',
    options: ['A type of WAN connection', 'A virtual local area network that logically segments a physical network', 'A VPN technology', 'A wireless LAN protocol'],
    correct: 1,
    explanation: 'A VLAN (Virtual LAN) is a logical grouping of network devices that appears to be on the same LAN regardless of their physical location. VLANs improve security and reduce broadcast domains.',
    difficulty: 'medium',
    hint: 'It creates logical segments within a physical network.'
  },
  {
    id: 'net-16',
    text: 'What is the maximum number of usable host addresses in a /24 subnet?',
    options: ['254', '255', '256', '128'],
    correct: 0,
    explanation: 'A /24 subnet has 256 total addresses (2^8). Two addresses are reserved: the network address and the broadcast address. So 256 - 2 = 254 usable host addresses.',
    difficulty: 'hard',
    hint: 'Subtract 2 from the total number of addresses (network and broadcast).'
  },
  {
    id: 'net-17',
    text: 'What does NAT stand for and what is its primary use?',
    options: ['Network Address Translation — maps private IP addresses to public IPs', 'Network Access Terminal — provides network access', 'Network Allocation Table — allocates bandwidth', 'Node Address Tracking — tracks connected devices'],
    correct: 0,
    explanation: 'NAT (Network Address Translation) translates private IP addresses used within a local network to a public IP address for internet communication. It helps conserve public IP addresses.',
    difficulty: 'medium',
    hint: 'It allows multiple devices on a private network to share a single public IP.'
  },
  {
    id: 'net-18',
    text: 'Which layer of the TCP/IP model corresponds to the OSI Session, Presentation, and Application layers?',
    options: ['Internet Layer', 'Transport Layer', 'Network Access Layer', 'Application Layer'],
    correct: 3,
    explanation: 'The TCP/IP Application Layer combines the functions of the OSI Session, Presentation, and Application layers. TCP/IP has 4 layers: Network Access, Internet, Transport, and Application.',
    difficulty: 'hard',
    hint: 'TCP/IP has fewer layers than OSI, so some OSI layers are combined.'
  },
  {
    id: 'net-19',
    text: 'Which protocol does ping use?',
    options: ['TCP', 'UDP', 'ICMP', 'ARP'],
    correct: 2,
    explanation: 'Ping uses ICMP (Internet Control Message Protocol). It sends ICMP Echo Request messages and listens for ICMP Echo Reply messages to test network connectivity and measure round-trip time.',
    difficulty: 'medium',
    hint: 'It is a control/diagnostic protocol, not a data transfer protocol.'
  },
  {
    id: 'net-20',
    text: 'What is the purpose of a firewall?',
    options: ['To speed up network traffic', 'To monitor and control incoming and outgoing network traffic based on security rules', 'To assign IP addresses to devices', 'To convert domain names to IP addresses'],
    correct: 1,
    explanation: 'A firewall monitors and controls network traffic based on predetermined security rules. It establishes a barrier between a trusted internal network and untrusted external networks.',
    difficulty: 'easy',
    hint: 'It acts as a security barrier for network traffic.'
  }
];
