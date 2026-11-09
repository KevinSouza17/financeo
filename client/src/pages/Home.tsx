import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleDollarSign,
  CircleHelp,
  CreditCard,
  Download,
  FileText,
  Filter,
  Landmark,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Pencil,
  PieChart,
  Plus,
  Search,
  Settings2,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie as RechartPie,
  PieChart as RechartPieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

type View = "dashboard" | "movimentacoes" | "contas" | "fluxo" | "orcamentos" | "relatorios" | "cadastros";
type MovementType = "receita" | "despesa";
type MovementStatus = "paid" | "pending" | "overdue";
type Movement = {
  id: string;
  description: string;
  type: MovementType;
  amount: number;
  category: string;
  account: string;
  costCenter: string;
  date: string;
  dueDate: string;
  status: MovementStatus;
};
type Account = { id: string; name: string; bank: string; openingBalance: number };
type Budget = { id: string; dimension: "Categoria" | "Centro de custo"; label: string; planned: number };

const STORAGE = {
  movements: "finwise-demo-movements-v1",
  accounts: "finwise-demo-accounts-v1",
  categories: "finwise-demo-categories-v1",
  centers: "finwise-demo-centers-v1",
  budgets: "finwise-demo-budgets-v1",
};

const seedMovements: Movement[] = [
  { id: "m1", description: "Projeto de consultoria · Atlas", type: "receita", amount: 48900, category: "Serviços", account: "Itaú Empresas", costCenter: "Comercial", date: "2026-11-04", dueDate: "2026-11-04", status: "paid" },
  { id: "m2", description: "Folha de pagamento", type: "despesa", amount: 68500, category: "Pessoal", account: "Itaú Empresas", costCenter: "Operações", date: "2026-11-05", dueDate: "2026-11-05", status: "paid" },
  { id: "m3", description: "Assinaturas de software", type: "despesa", amount: 1849.9, category: "Tecnologia", account: "Itaú Empresas", costCenter: "Operações", date: "2026-11-02", dueDate: "2026-11-02", status: "paid" },
  { id: "m4", description: "Aluguel do escritório", type: "despesa", amount: 4600, category: "Infraestrutura", account: "Itaú Empresas", costCenter: "Administrativo", date: "2026-11-03", dueDate: "2026-11-03", status: "paid" },
  { id: "m5", description: "Contrato mensal · Arco Varejo", type: "receita", amount: 22400, category: "Serviços", account: "Banco Inter PJ", costCenter: "Comercial", date: "2026-11-06", dueDate: "2026-11-06", status: "paid" },
  { id: "m6", description: "Tributos federais", type: "despesa", amount: 9500, category: "Impostos", account: "Banco Inter PJ", costCenter: "Administrativo", date: "2026-11-07", dueDate: "2026-11-07", status: "paid" },
  { id: "m7", description: "Fornecedor Delta · equipamentos", type: "despesa", amount: 12400, category: "Equipamentos", account: "Itaú Empresas", costCenter: "Operações", date: "2026-11-10", dueDate: "2026-11-12", status: "pending" },
  { id: "m8", description: "Campanha de performance", type: "despesa", amount: 3200, category: "Marketing", account: "Itaú Empresas", costCenter: "Comercial", date: "2026-11-10", dueDate: "2026-11-15", status: "pending" },
  { id: "m9", description: "Projeto de logística · ViaNorte", type: "receita", amount: 18750, category: "Serviços", account: "Banco Inter PJ", costCenter: "Comercial", date: "2026-11-10", dueDate: "2026-11-18", status: "pending" },
  { id: "m10", description: "Seguro empresarial", type: "despesa", amount: 2250, category: "Infraestrutura", account: "Itaú Empresas", costCenter: "Administrativo", date: "2026-11-04", dueDate: "2026-11-06", status: "overdue" },
  { id: "m11", description: "Assessoria financeira · outubro", type: "receita", amount: 34000, category: "Serviços", account: "Itaú Empresas", costCenter: "Comercial", date: "2026-10-29", dueDate: "2026-10-29", status: "paid" },
  { id: "m12", description: "Hospedagem de sistemas · outubro", type: "despesa", amount: 1290, category: "Tecnologia", account: "Banco Inter PJ", costCenter: "Operações", date: "2026-10-28", dueDate: "2026-10-28", status: "paid" },
  { id: "m13", description: "Faturamento consolidado · junho", type: "receita", amount: 148000, category: "Serviços", account: "Itaú Empresas", costCenter: "Comercial", date: "2026-06-29", dueDate: "2026-06-29", status: "paid" },
  { id: "m14", description: "Despesas operacionais · junho", type: "despesa", amount: 112000, category: "Pessoal", account: "Itaú Empresas", costCenter: "Operações", date: "2026-06-30", dueDate: "2026-06-30", status: "paid" },
  { id: "m15", description: "Faturamento consolidado · julho", type: "receita", amount: 173000, category: "Serviços", account: "Itaú Empresas", costCenter: "Comercial", date: "2026-07-30", dueDate: "2026-07-30", status: "paid" },
  { id: "m16", description: "Despesas operacionais · julho", type: "despesa", amount: 126000, category: "Pessoal", account: "Itaú Empresas", costCenter: "Operações", date: "2026-07-29", dueDate: "2026-07-29", status: "paid" },
  { id: "m17", description: "Faturamento consolidado · agosto", type: "receita", amount: 161000, category: "Serviços", account: "Itaú Empresas", costCenter: "Comercial", date: "2026-08-28", dueDate: "2026-08-28", status: "paid" },
  { id: "m18", description: "Despesas operacionais · agosto", type: "despesa", amount: 132000, category: "Pessoal", account: "Itaú Empresas", costCenter: "Operações", date: "2026-08-28", dueDate: "2026-08-28", status: "paid" },
  { id: "m19", description: "Faturamento consolidado · setembro", type: "receita", amount: 198000, category: "Serviços", account: "Itaú Empresas", costCenter: "Comercial", date: "2026-09-29", dueDate: "2026-09-29", status: "paid" },
  { id: "m20", description: "Despesas operacionais · setembro", type: "despesa", amount: 141000, category: "Pessoal", account: "Itaú Empresas", costCenter: "Operações", date: "2026-09-29", dueDate: "2026-09-29", status: "paid" },
  { id: "m21", description: "Faturamento recorrente · outubro", type: "receita", amount: 152000, category: "Serviços", account: "Itaú Empresas", costCenter: "Comercial", date: "2026-10-27", dueDate: "2026-10-27", status: "paid" },
  { id: "m22", description: "Despesas operacionais · outubro", type: "despesa", amount: 146710, category: "Pessoal", account: "Itaú Empresas", costCenter: "Operações", date: "2026-10-29", dueDate: "2026-10-29", status: "paid" },
];
const seedAccounts: Account[] = [
  { id: "a1", name: "Itaú Empresas", bank: "Itaú Unibanco", openingBalance: 194000 },
  { id: "a2", name: "Banco Inter PJ", bank: "Banco Inter", openingBalance: 67800.8 },
];
const seedCategories = ["Serviços", "Pessoal", "Tecnologia", "Infraestrutura", "Impostos", "Equipamentos", "Marketing"];
const seedCenters = ["Comercial", "Operações", "Administrativo"];
const seedBudgets: Budget[] = [
  { id: "b1", dimension: "Categoria", label: "Pessoal", planned: 76000 },
  { id: "b2", dimension: "Categoria", label: "Tecnologia", planned: 8500 },
  { id: "b3", dimension: "Categoria", label: "Marketing", planned: 12000 },
  { id: "b4", dimension: "Centro de custo", label: "Operações", planned: 92000 },
  { id: "b5", dimension: "Centro de custo", label: "Comercial", planned: 25000 },
  { id: "b6", dimension: "Categoria", label: "Infraestrutura", planned: 14000 },
];
const flowMonths = [
  { key: "2025-12", label: "Dez/25" },
  { key: "2026-01", label: "Jan" },
  { key: "2026-02", label: "Fev" },
  { key: "2026-03", label: "Mar" },
  { key: "2026-04", label: "Abr" },
  { key: "2026-05", label: "Mai" },
  { key: "2026-06", label: "Jun" },
  { key: "2026-07", label: "Jul" },
  { key: "2026-08", label: "Ago" },
  { key: "2026-09", label: "Set" },
  { key: "2026-10", label: "Out" },
  { key: "2026-11", label: "Nov" },
  { key: "2026-12", label: "Dez" },
];
const categoryColors = ["#6e9f80", "#aec7b5", "#d4aa6b", "#9aa7a0", "#d5d9d5", "#b18e79", "#88a8a0"];
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const compactBrl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 });
const ptDate = (date: string) => date ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(`${date}T12:00:00`)).replace(" de ", " ") : "—";
const currentMonth = "2026-11";

function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* armazenamento local indisponível */ }
  }, [key, value]);
  return [value, setValue] as const;
}

const navItems: { id: View; label: string; icon: LucideIcon; group: string }[] = [
  { id: "dashboard", label: "Visão geral", icon: LayoutDashboard, group: "PAINEL" },
  { id: "movimentacoes", label: "Movimentações", icon: ArrowLeftRight, group: "PAINEL" },
  { id: "contas", label: "Contas a pagar e receber", icon: CreditCard, group: "FINANCEIRO" },
  { id: "fluxo", label: "Fluxo de caixa", icon: Activity, group: "FINANCEIRO" },
  { id: "orcamentos", label: "Orçamentos", icon: PieChart, group: "GESTÃO" },
  { id: "relatorios", label: "Relatórios", icon: BarChart3, group: "GESTÃO" },
  { id: "cadastros", label: "Cadastros", icon: Settings2, group: "GESTÃO" },
];
const viewTitles: Record<View, string> = {
  dashboard: "Visão geral", movimentacoes: "Movimentações", contas: "Contas a pagar e receber", fluxo: "Fluxo de caixa", orcamentos: "Orçamentos", relatorios: "Relatórios financeiros", cadastros: "Contas e categorias",
};

function StatusBadge({ status, type }: { status: MovementStatus; type: MovementType }) {
  const label = status === "paid" ? (type === "receita" ? "Recebido" : "Pago") : status === "overdue" ? "Atrasado" : type === "receita" ? "A receber" : "A pagar";
  return <span className={`status-badge status-${status}`}>{status === "paid" ? <Check size={12} /> : status === "overdue" ? <CircleAlert size={12} /> : <CalendarDays size={12} />}{label}</span>;
}

function MovementTable({ rows, onEdit, onDelete, onSettle, showActions = true }: {
  rows: Movement[]; onEdit?: (item: Movement) => void; onDelete?: (item: Movement) => void; onSettle?: (item: Movement) => void; showActions?: boolean;
}) {
  if (!rows.length) return <div className="empty-state"><span className="empty-icon"><Search size={19} /></span><strong>Nenhum lançamento encontrado</strong><p>Tente ajustar os filtros ou cadastre uma nova movimentação.</p></div>;
  return <div className="table-scroll"><table className="finance-table"><thead><tr><th>Descrição</th><th>Categoria</th><th>Vencimento</th><th>Conta</th><th>Status</th><th className="align-right">Valor</th>{showActions && <th aria-label="Ações" />}</tr></thead><tbody>
    {rows.map((row) => <tr key={row.id}>
      <td><div className="movement-name"><span className={`movement-symbol ${row.type}`} aria-hidden="true">{row.type === "receita" ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}</span><span><strong>{row.description}</strong><small>{ptDate(row.date)} · {row.costCenter}</small></span></div></td>
      <td><span className="category-label">{row.category}</span></td><td className="date-cell">{ptDate(row.dueDate)}</td><td className="account-cell">{row.account}</td><td><StatusBadge status={row.status} type={row.type} /></td>
      <td className={`amount-cell ${row.type === "receita" ? "positive" : ""}`}>{row.type === "receita" ? "+ " : "− "}{brl.format(row.amount)}</td>
      {showActions && <td><div className="row-actions">{row.status !== "paid" && onSettle && <button className="icon-button settle-button" onClick={() => onSettle(row)} aria-label="Marcar como pago/recebido" title="Dar baixa"><Check size={15} /></button>}{onEdit && <button className="icon-button" onClick={() => onEdit(row)} aria-label="Editar lançamento"><Pencil size={15} /></button>}{onDelete && <button className="icon-button danger-icon" onClick={() => onDelete(row)} aria-label="Excluir lançamento"><Trash2 size={15} /></button>}</div></td>}
    </tr>)}
  </tbody></table></div>;
}

function MetricCard({ label, amount, detail, icon: Icon, trend, tone = "neutral" }: { label: string; amount: string; detail: string; icon: LucideIcon; trend?: string; tone?: "neutral" | "green" | "amber" | "red" }) {
  return <article className="metric-card"><div className="metric-top"><span className="metric-label">{label}</span><span className={`metric-icon ${tone}`}><Icon size={17} /></span></div><strong className="metric-value">{amount}</strong><div className="metric-bottom"><span className={`metric-detail ${tone === "red" ? "negative-detail" : tone === "green" ? "positive-detail" : ""}`}>{trend && <TrendingUp size={13} />}{detail}</span></div></article>;
}

function Modal({ open, title, onClose, children, wide = false }: { open: boolean; title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className={`modal-card ${wide ? "modal-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}><header className="modal-header"><div><p className="eyebrow">FINWISE · FINANCEIRO</p><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={19} /></button></header>{children}</section></div>;
}

function CurrencyTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><span>{label}</span>{payload.map((item) => <div key={item.name}><i style={{ background: item.color }} />{item.name}: <strong>{brl.format(item.value)}</strong></div>)}</div>;
}

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [movements, setMovements] = useLocalState(STORAGE.movements, seedMovements);
  const [accounts, setAccounts] = useLocalState(STORAGE.accounts, seedAccounts);
  const [categories, setCategories] = useLocalState(STORAGE.categories, seedCategories);
  const [centers, setCenters] = useLocalState(STORAGE.centers, seedCenters);
  const [budgets, setBudgets] = useLocalState(STORAGE.budgets, seedBudgets);
  const [movementModal, setMovementModal] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [accountFilter, setAccountFilter] = useState("todos");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [budgetDimension, setBudgetDimension] = useState<"Categoria" | "Centro de custo">("Categoria");
  const [flowPeriod, setFlowPeriod] = useState(6);
  const [reportPeriod, setReportPeriod] = useState("2026-11");
  const [budgetEditor, setBudgetEditor] = useState<Budget | "new" | null>(null);
  const [budgetLabel, setBudgetLabel] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [newAccount, setNewAccount] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newCenter, setNewCenter] = useState("");
  const [accountBalanceDraft, setAccountBalanceDraft] = useState("");

  const paidMovements = movements.filter((m) => m.status === "paid" && m.date.startsWith(currentMonth));
  const totalIncome = paidMovements.filter((m) => m.type === "receita").reduce((sum, m) => sum + m.amount, 0);
  const totalExpenses = paidMovements.filter((m) => m.type === "despesa").reduce((sum, m) => sum + m.amount, 0);
  const netResult = totalIncome - totalExpenses;
  const cashBalance = accounts.reduce((total, account) => total + account.openingBalance + movements.filter((m) => m.status === "paid" && m.date.startsWith(currentMonth) && m.account === account.name).reduce((sum, m) => sum + (m.type === "receita" ? m.amount : -m.amount), 0), 0);
  const payablesOpen = movements.filter((m) => m.type === "despesa" && m.status !== "paid").reduce((sum, m) => sum + m.amount, 0);
  const receivablesOpen = movements.filter((m) => m.type === "receita" && m.status !== "paid").reduce((sum, m) => sum + m.amount, 0);
  const filteredMovements = useMemo(() => movements.filter((item) => {
    const normalized = search.trim().toLocaleLowerCase("pt-BR");
    return (!normalized || `${item.description} ${item.category} ${item.account} ${item.costCenter}`.toLocaleLowerCase("pt-BR").includes(normalized)) &&
      (typeFilter === "todos" || item.type === typeFilter) && (statusFilter === "todos" || item.status === statusFilter) &&
      (accountFilter === "todos" || item.account === accountFilter) && (categoryFilter === "todos" || item.category === categoryFilter) &&
      (!fromDate || item.date >= fromDate) && (!toDate || item.date <= toDate);
  }).sort((a, b) => b.date.localeCompare(a.date)), [movements, search, typeFilter, statusFilter, accountFilter, categoryFilter, fromDate, toDate]);
  const recentMovements = [...movements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const openMovements = movements.filter((m) => m.status !== "paid").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const flowChartData = useMemo(() => {
    const actualMonths = flowMonths.slice(0, -1).map(({ key, label }) => {
      const rows = movements.filter((m) => (m.status === "paid" ? m.date : m.dueDate).startsWith(key));
      return {
        month: label,
        entradas: rows.filter((m) => m.type === "receita").reduce((sum, m) => sum + m.amount, 0),
        saidas: rows.filter((m) => m.type === "despesa").reduce((sum, m) => sum + m.amount, 0),
      };
    });
    const recent = actualMonths.slice(-3);
    const avg = (key: "entradas" | "saidas") => recent.length ? recent.reduce((sum, month) => sum + month[key], 0) / recent.length : 0;
    const decemberRows = movements.filter((m) => (m.status === "paid" ? m.date : m.dueDate).startsWith("2026-12"));
    const forecast = decemberRows.length ? {
      month: "Dez",
      entradas: decemberRows.filter((m) => m.type === "receita").reduce((sum, m) => sum + m.amount, 0),
      saidas: decemberRows.filter((m) => m.type === "despesa").reduce((sum, m) => sum + m.amount, 0),
    } : { month: "Dez · prev.", entradas: Math.round(avg("entradas") * 1.04), saidas: Math.round(avg("saidas") * 1.04) };
    return [...actualMonths, forecast];
  }, [movements]);

  const resetFilters = () => { setSearch(""); setTypeFilter("todos"); setStatusFilter("todos"); setAccountFilter("todos"); setCategoryFilter("todos"); setFromDate(""); setToDate(""); };
  const openNewMovement = () => { setEditingMovement(null); setMovementModal(true); };
  const openEditMovement = (item: Movement) => { setEditingMovement(item); setMovementModal(true); };
  const saveMovement = (data: Omit<Movement, "id">) => {
    if (editingMovement) {
      setMovements((all) => all.map((item) => item.id === editingMovement.id ? { ...data, id: item.id } : item));
      toast.success("Movimentação atualizada.");
    } else {
      setMovements((all) => [{ ...data, id: `m-${Date.now()}` }, ...all]);
      toast.success("Movimentação adicionada.");
    }
    setMovementModal(false);
    setEditingMovement(null);
  };
  const deleteMovement = (item: Movement) => {
    if (!window.confirm(`Excluir “${item.description}”?`)) return;
    setMovements((all) => all.filter((entry) => entry.id !== item.id));
    toast.success("Movimentação excluída.");
  };
  const settleMovement = (item: Movement) => {
    setMovements((all) => all.map((entry) => entry.id === item.id ? { ...entry, status: "paid" } : entry));
    toast.success(item.type === "receita" ? "Recebimento registrado." : "Pagamento registrado.");
  };
  const exportCsv = (rows = filteredMovements) => {
    const headings = ["Descrição", "Tipo", "Valor", "Categoria", "Conta", "Centro de custo", "Data", "Vencimento", "Status"];
    const data = rows.map((m) => [m.description, m.type, m.amount.toFixed(2).replace(".", ","), m.category, m.account, m.costCenter, m.date, m.dueDate, m.status === "paid" ? "Pago/Recebido" : m.status === "overdue" ? "Atrasado" : "Em aberto"]);
    const csv = "\ufeff" + [headings, ...data].map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `finwise-lancamentos-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
    toast.success(`${rows.length} lançamento(s) exportado(s) em CSV.`);
  };
  const navigate = (next: View) => { setView(next); setMobileNavOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const addListValue = (kind: "account" | "category" | "center") => {
    if (kind === "account") {
      const name = newAccount.trim(); if (!name) return;
      if (accounts.some((a) => a.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"))) return toast.error("Essa conta já está cadastrada.");
      setAccounts((all) => [...all, { id: `a-${Date.now()}`, name, bank: "Conta empresarial", openingBalance: Number(accountBalanceDraft) || 0 }]); setNewAccount(""); setAccountBalanceDraft(""); toast.success("Conta adicionada.");
    } else if (kind === "category") {
      const name = newCategory.trim(); if (!name) return;
      if (categories.some((item) => item.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"))) return toast.error("Essa categoria já está cadastrada.");
      setCategories((all) => [...all, name]); setNewCategory(""); toast.success("Categoria adicionada.");
    } else {
      const name = newCenter.trim(); if (!name) return;
      if (centers.some((item) => item.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"))) return toast.error("Esse centro de custo já está cadastrado.");
      setCenters((all) => [...all, name]); setNewCenter(""); toast.success("Centro de custo adicionado.");
    }
  };
  const removeAccount = (account: Account) => {
    if (movements.some((m) => m.account === account.name)) return toast.error("Esta conta está vinculada a lançamentos e não pode ser removida.");
    setAccounts((all) => all.filter((a) => a.id !== account.id)); toast.success("Conta removida.");
  };
  const openBudgetEditor = (budget: Budget | "new") => {
    setBudgetEditor(budget);
    setBudgetLabel(budget === "new" ? (budgetDimension === "Categoria" ? categories[0] ?? "" : centers[0] ?? "") : budget.label);
    setBudgetAmount(budget === "new" ? "" : String(budget.planned));
    if (budget !== "new") setBudgetDimension(budget.dimension);
  };
  const saveBudget = (event: FormEvent) => {
    event.preventDefault();
    const amount = Number(budgetAmount);
    if (!budgetLabel.trim() || !amount || amount < 0) return toast.error("Informe uma descrição e um valor válido.");
    if (budgetEditor === "new") setBudgets((all) => [...all, { id: `b-${Date.now()}`, dimension: budgetDimension, label: budgetLabel.trim(), planned: amount }]);
    else if (budgetEditor) setBudgets((all) => all.map((item) => item.id === budgetEditor.id ? { ...item, dimension: budgetDimension, label: budgetLabel.trim(), planned: amount } : item));
    setBudgetEditor(null); toast.success("Orçamento atualizado.");
  };
  const setViewAndClear = (next: View) => { if (next === "movimentacoes") resetFilters(); navigate(next); };

  const renderDashboard = () => {
    const expenseData = categories.map((category) => ({ name: category, value: paidMovements.filter((m) => m.type === "despesa" && m.category === category).reduce((sum, m) => sum + m.amount, 0) })).filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
    const periodRows = movements.filter((m) => m.date.startsWith(currentMonth));
    const dueSoon = movements.filter((m) => m.status !== "paid").length;
    return <>
      <section className="welcome-row"><div><span className="eyebrow">SEGUNDA-FEIRA, 9 DE NOVEMBRO DE 2026</span><h2>Bom dia, equipe <span className="wave-mark">↗</span></h2><p>Acompanhe a saúde financeira do seu negócio em um só lugar.</p></div><button className="button-primary" onClick={openNewMovement}><Plus size={17} />Nova movimentação</button></section>
      <section className="metrics-grid" aria-label="Indicadores financeiros">
        <MetricCard label="Saldo consolidado" amount={brl.format(cashBalance)} detail="Nas contas cadastradas" icon={Wallet} tone="green" />
        <MetricCard label="Receitas realizadas" amount={brl.format(totalIncome)} detail="Neste mês" icon={ArrowDownRight} tone="green" trend="" />
        <MetricCard label="Despesas realizadas" amount={brl.format(totalExpenses)} detail="Neste mês" icon={ArrowUpRight} tone="amber" />
        <MetricCard label="Resultado do período" amount={brl.format(netResult)} detail={netResult >= 0 ? "Saldo positivo no mês" : "Atenção ao saldo do período"} icon={CircleDollarSign} tone={netResult >= 0 ? "green" : "red"} />
      </section>
      <section className="dashboard-grid">
        <article className="panel cash-chart-panel"><div className="panel-heading"><div><span className="eyebrow">ACOMPANHAMENTO</span><h3>Fluxo de caixa</h3><p>Entradas e saídas ao longo do tempo</p></div><button className="select-button" onClick={() => navigate("fluxo")}>Últimos 6 meses <ChevronDown size={14} /></button></div><div className="chart-legend"><span><i className="legend-dot income-dot" />Entradas</span><span><i className="legend-dot expense-dot" />Saídas</span><span className="chart-note"><span className="forecast-line" />Projeção</span></div><div className="main-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={flowChartData.slice(-7)} margin={{ top: 9, right: 6, left: -15, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#77a88b" stopOpacity={0.2} /><stop offset="95%" stopColor="#77a88b" stopOpacity={0.01} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d3ad78" stopOpacity={0.13} /><stop offset="95%" stopColor="#d3ad78" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#eceeea" strokeDasharray="3 5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#969e98", fontSize: 11 }} dy={9} /><YAxis tickFormatter={(v) => compactBrl.format(v)} axisLine={false} tickLine={false} tick={{ fill: "#969e98", fontSize: 10 }} width={63} /><ChartTooltip content={<CurrencyTooltip />} /><Area type="monotone" dataKey="entradas" name="Entradas" stroke="#679979" strokeWidth={2.5} fill="url(#incomeFill)" activeDot={{ r: 5, strokeWidth: 0 }} /><Area type="monotone" dataKey="saidas" name="Saídas" stroke="#c6a16f" strokeWidth={2.2} fill="url(#expenseFill)" activeDot={{ r: 5, strokeWidth: 0 }} /></AreaChart></ResponsiveContainer></div><div className="cash-footnote"><span><span className="live-dot" />Visão consolidada</span><button className="text-link" onClick={() => navigate("fluxo")}>Ver fluxo completo <ArrowRight size={14} /></button></div></article>
        <article className="panel expense-panel"><div className="panel-heading"><div><span className="eyebrow">NOVEMBRO 2026</span><h3>Despesas por categoria</h3></div><button className="icon-button" onClick={() => navigate("relatorios")} aria-label="Ver relatório"><MoreHorizontal size={19} /></button></div>{expenseData.length ? <><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><RechartPieChart><RechartPie data={expenseData} dataKey="value" nameKey="name" innerRadius="72%" outerRadius="94%" paddingAngle={3} stroke="none">{expenseData.map((item, index) => <Cell key={item.name} fill={categoryColors[index % categoryColors.length]} />)}</RechartPie><ChartTooltip formatter={(value) => brl.format(Number(value))} /></RechartPieChart></ResponsiveContainer><div className="donut-center"><span>Total realizado</span><strong>{compactBrl.format(totalExpenses)}</strong></div></div><div className="category-legend">{expenseData.slice(0, 4).map((item, index) => <div key={item.name}><span><i style={{ background: categoryColors[index % categoryColors.length] }} />{item.name}</span><strong>{brl.format(item.value)}</strong></div>)}</div></> : <div className="empty-state compact-empty">Sem despesas realizadas neste período.</div>}</article>
      </section>
      <section className="panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">ATIVIDADE RECENTE</span><h3>Últimas movimentações</h3></div><button className="text-link" onClick={() => setViewAndClear("movimentacoes")}>Ver todas <ArrowRight size={14} /></button></div><MovementTable rows={recentMovements} showActions={false} /><div className="recent-footnote"><span>{dueSoon} compromisso(s) financeiro(s) em aberto</span><button className="text-link" onClick={() => navigate("contas")}>Conferir vencimentos <ArrowRight size={14} /></button></div></section>
      <p className="data-note"><CircleHelp size={14} />Dados demonstrativos salvos apenas neste navegador. Nenhuma conta bancária está conectada.</p>
    </>;
  };

  const renderMovements = () => <>
    <section className="page-intro"><div><span className="eyebrow">REGISTROS FINANCEIROS</span><h2>Movimentações</h2><p>Registre e acompanhe cada entrada e saída do seu negócio.</p></div><button className="button-primary" onClick={openNewMovement}><Plus size={17} />Nova movimentação</button></section>
    <section className="panel records-panel"><div className="records-toolbar"><label className="search-field"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar descrição, categoria ou conta" aria-label="Buscar movimentação" />{search && <button className="clear-search" onClick={() => setSearch("")} aria-label="Limpar busca"><X size={14} /></button>}</label><div className="filter-label"><Filter size={15} /><span>Filtros</span></div><select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filtrar por tipo"><option value="todos">Todos os tipos</option><option value="receita">Receitas</option><option value="despesa">Despesas</option></select><select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Filtrar por categoria"><option value="todos">Todas as categorias</option>{categories.map((c) => <option key={c}>{c}</option>)}</select><select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filtrar por status"><option value="todos">Todos os status</option><option value="paid">Pago/recebido</option><option value="pending">Em aberto</option><option value="overdue">Atrasado</option></select><select className="filter-select" value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)} aria-label="Filtrar por conta"><option value="todos">Todas as contas</option>{accounts.map((a) => <option key={a.id}>{a.name}</option>)}</select></div><div className="date-filter-row"><span>Período do lançamento</span><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} aria-label="Data inicial" /><span>até</span><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} aria-label="Data final" />{(search || typeFilter !== "todos" || categoryFilter !== "todos" || statusFilter !== "todos" || accountFilter !== "todos" || fromDate || toDate) && <button className="text-link reset-link" onClick={resetFilters}>Limpar filtros <X size={13} /></button>}<span className="result-count">{filteredMovements.length} lançamento(s)</span></div><MovementTable rows={filteredMovements} onEdit={openEditMovement} onDelete={deleteMovement} onSettle={settleMovement} /></section>
    <p className="data-note"><CircleHelp size={14} />Os registros exibidos são demonstrativos e permanecem armazenados apenas neste navegador.</p>
  </>;

  const renderAccounts = () => {
    const payable = openMovements.filter((m) => m.type === "despesa");
    const receivable = openMovements.filter((m) => m.type === "receita");
    return <>
      <section className="page-intro"><div><span className="eyebrow">CONTROLE DE VENCIMENTOS</span><h2>Contas a pagar e receber</h2><p>Saiba o que está por vencer, em aberto ou precisa de atenção.</p></div><button className="button-primary" onClick={openNewMovement}><Plus size={17} />Nova movimentação</button></section>
      <section className="metrics-grid three-metrics"><MetricCard label="Total a pagar" amount={brl.format(payable.reduce((s, m) => s + m.amount, 0))} detail={`${payable.length} conta(s) em aberto`} icon={ArrowUpRight} tone="amber" /><MetricCard label="Total a receber" amount={brl.format(receivable.reduce((s, m) => s + m.amount, 0))} detail={`${receivable.length} recebimento(s) previsto(s)`} icon={ArrowDownRight} tone="green" /><MetricCard label="Vencido" amount={brl.format(openMovements.filter((m) => m.status === "overdue").reduce((s, m) => s + m.amount, 0))} detail={`${openMovements.filter((m) => m.status === "overdue").length} compromisso(s) atrasado(s)`} icon={CircleAlert} tone="red" /></section>
      <section className="panel due-panel"><div className="panel-heading"><div><span className="eyebrow">AGENDA FINANCEIRA</span><h3>Compromissos em aberto</h3><p>Registre o pagamento ou recebimento ao concluir a operação.</p></div><span className="due-counter">{openMovements.length} em aberto</span></div><MovementTable rows={openMovements} onEdit={openEditMovement} onDelete={deleteMovement} onSettle={settleMovement} /></section>
      <section className="split-panels"><article className="panel mini-due-panel"><span className="eyebrow">A PAGAR</span><h3>{brl.format(payable.reduce((s, m) => s + m.amount, 0))}</h3><p>Despesas em aberto ou vencidas</p><button className="text-link" onClick={() => { setTypeFilter("despesa"); navigate("movimentacoes"); }}>Ver despesas <ArrowRight size={14} /></button></article><article className="panel mini-due-panel"><span className="eyebrow">A RECEBER</span><h3>{brl.format(receivable.reduce((s, m) => s + m.amount, 0))}</h3><p>Receitas aguardando recebimento</p><button className="text-link" onClick={() => { setTypeFilter("receita"); navigate("movimentacoes"); }}>Ver recebíveis <ArrowRight size={14} /></button></article></section>
    </>;
  };

  const renderFlow = () => {
    const monthMovements = movements.filter((m) => m.date.startsWith(currentMonth));
    const selectedFlowData = flowChartData.slice(-(flowPeriod + 1));
    const projectedIncome = monthMovements.filter((m) => m.type === "receita").reduce((s, m) => s + m.amount, 0);
    const projectedExpenses = monthMovements.filter((m) => m.type === "despesa").reduce((s, m) => s + m.amount, 0);
    return <>
      <section className="page-intro"><div><span className="eyebrow">PREVISIBILIDADE FINANCEIRA</span><h2>Fluxo de caixa</h2><p>Compare o realizado com os compromissos e projete seus próximos passos.</p></div><button className="button-secondary" onClick={() => exportCsv(movements)}><Download size={16} />Exportar dados</button></section>
      <section className="metrics-grid three-metrics"><MetricCard label="Saldo atual" amount={brl.format(cashBalance)} detail="Posição consolidada" icon={Wallet} tone="green" /><MetricCard label="Entradas previstas" amount={brl.format(projectedIncome)} detail="Realizadas + a receber em novembro" icon={ArrowDownRight} tone="green" /><MetricCard label="Saídas previstas" amount={brl.format(projectedExpenses)} detail="Pagas + a pagar em novembro" icon={ArrowUpRight} tone="amber" /></section>
      <section className="panel flow-full-panel"><div className="panel-heading"><div><span className="eyebrow">ÚLTIMOS {flowPeriod} MESES · DEZEMBRO PROJETADO</span><h3>Entradas e saídas</h3><p>A linha pontilhada representa a projeção de dezembro.</p></div><select className="select-button" aria-label="Filtrar fluxo por período" value={flowPeriod} onChange={(event) => setFlowPeriod(Number(event.target.value))}><option value={3}>Últimos 3 meses</option><option value={6}>Últimos 6 meses</option><option value={12}>Últimos 12 meses</option></select></div><div className="chart-legend"><span><i className="legend-dot income-dot" />Entradas</span><span><i className="legend-dot expense-dot" />Saídas</span></div><div className="flow-large-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={selectedFlowData} margin={{ top: 10, right: 18, left: 0, bottom: 4 }}><defs><linearGradient id="flowGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#77a88b" stopOpacity={0.18} /><stop offset="100%" stopColor="#77a88b" stopOpacity={0.01} /></linearGradient><linearGradient id="flowGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d3ad78" stopOpacity={0.13} /><stop offset="100%" stopColor="#d3ad78" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#eceeea" strokeDasharray="3 5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#969e98", fontSize: 12 }} dy={10} /><YAxis tickFormatter={(v) => compactBrl.format(v)} axisLine={false} tickLine={false} tick={{ fill: "#969e98", fontSize: 11 }} width={72} /><ChartTooltip content={<CurrencyTooltip />} /><Area type="monotone" dataKey="entradas" name="Entradas" stroke="#679979" strokeWidth={2.7} fill="url(#flowGreen)" activeDot={{ r: 5, strokeWidth: 0 }} /><Area type="monotone" dataKey="saidas" name="Saídas" stroke="#c6a16f" strokeWidth={2.3} fill="url(#flowGold)" activeDot={{ r: 5, strokeWidth: 0 }} /></AreaChart></ResponsiveContainer></div><div className="flow-summary"><div><span>Resultado previsto do mês</span><strong className={projectedIncome - projectedExpenses >= 0 ? "positive" : "negative-detail"}>{brl.format(projectedIncome - projectedExpenses)}</strong></div><div><span>Valores em aberto</span><strong>{brl.format(payablesOpen + receivablesOpen)}</strong></div><div><span>Variação de entradas vs. mês anterior</span><strong className="positive-detail"><TrendingUp size={15} /> +12,4%</strong></div></div></section>
      <section className="panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">PRÓXIMOS VENCIMENTOS</span><h3>Movimentações projetadas</h3></div><button className="text-link" onClick={() => navigate("contas")}>Ver agenda <ArrowRight size={14} /></button></div><MovementTable rows={openMovements} onSettle={settleMovement} showActions /></section>
    </>;
  };

  const getBudgetSpent = (budget: Budget) => paidMovements.filter((m) => m.type === "despesa" && (budget.dimension === "Categoria" ? m.category === budget.label : m.costCenter === budget.label)).reduce((s, m) => s + m.amount, 0);
  const renderBudgets = () => {
    const activeBudgets = budgets.filter((b) => b.dimension === budgetDimension);
    const plannedTotal = activeBudgets.reduce((s, b) => s + b.planned, 0);
    const spentTotal = activeBudgets.reduce((s, b) => s + getBudgetSpent(b), 0);
    return <>
      <section className="page-intro"><div><span className="eyebrow">PLANEJAMENTO</span><h2>Orçamentos</h2><p>Compare o planejado com as despesas realizadas.</p></div><button className="button-primary" onClick={() => openBudgetEditor("new")}><Plus size={17} />Novo orçamento</button></section>
      <section className="budget-overview"><article className="panel budget-total-card"><div className="budget-total-icon"><PieChart size={19} /></div><div><span>Orçamento previsto</span><strong>{brl.format(plannedTotal)}</strong></div><small>{budgetDimension.toLocaleLowerCase("pt-BR")}s monitoradas</small></article><article className="panel budget-total-card"><div className="budget-total-icon spent"><TrendingDown size={19} /></div><div><span>Realizado no período</span><strong>{brl.format(spentTotal)}</strong></div><small>{plannedTotal ? `${Math.max(0, Math.round((spentTotal / plannedTotal) * 100))}% do valor previsto` : "Sem valores previstos"}</small></article><article className="panel budget-total-card"><div className="budget-total-icon available"><CircleDollarSign size={19} /></div><div><span>Disponível</span><strong>{brl.format(plannedTotal - spentTotal)}</strong></div><small>Previsto menos realizado</small></article></section>
      <section className="panel budgets-panel"><div className="panel-heading"><div><span className="eyebrow">NOVEMBRO 2026</span><h3>Desempenho por {budgetDimension.toLocaleLowerCase("pt-BR")}</h3></div><div className="segmented"><button className={budgetDimension === "Categoria" ? "selected" : ""} onClick={() => setBudgetDimension("Categoria")}>Categorias</button><button className={budgetDimension === "Centro de custo" ? "selected" : ""} onClick={() => setBudgetDimension("Centro de custo")}>Centros de custo</button></div></div>{activeBudgets.length ? <div className="budget-list">{activeBudgets.map((budget) => { const spent = getBudgetSpent(budget); const pct = budget.planned > 0 ? Math.min((spent / budget.planned) * 100, 100) : 0; const exceeds = spent > budget.planned; return <div className="budget-row" key={budget.id}><div className="budget-row-heading"><div><span className="budget-avatar">{budget.label.slice(0, 1).toUpperCase()}</span><strong>{budget.label}</strong></div><button className="icon-button" aria-label={`Editar orçamento de ${budget.label}`} onClick={() => openBudgetEditor(budget)}><Pencil size={15} /></button></div><div className="budget-progress"><div className={`progress-track ${exceeds ? "over-budget" : ""}`}><span style={{ width: `${pct}%` }} /></div><strong className={exceeds ? "negative-detail" : ""}>{Math.round(budget.planned ? spent / budget.planned * 100 : 0)}%</strong></div><div className="budget-row-foot"><span>Realizado <strong>{brl.format(spent)}</strong></span><span>Previsto <strong>{brl.format(budget.planned)}</strong></span><span className={exceeds ? "negative-detail" : ""}>{exceeds ? "Acima do limite" : `Restam ${brl.format(budget.planned - spent)}`}</span></div></div>; })}</div> : <div className="empty-state"><strong>Nenhum orçamento para exibir</strong><p>Adicione um valor previsto para acompanhar o realizado.</p><button className="button-primary" onClick={() => openBudgetEditor("new")}><Plus size={16} />Criar orçamento</button></div>}</section>
      <p className="data-note"><CircleHelp size={14} />O realizado considera as despesas já marcadas como pagas no período demonstrativo.</p>
    </>;
  };

  const renderReports = () => {
    const reportRows = movements.filter((m) => reportPeriod === "last6" ? m.date >= "2026-06-01" && m.date <= "2026-11-30" : m.date.startsWith(reportPeriod));
    const reportPaidRows = reportRows.filter((m) => m.status === "paid");
    const reportIncome = reportPaidRows.filter((m) => m.type === "receita").reduce((sum, m) => sum + m.amount, 0);
    const reportExpenses = reportPaidRows.filter((m) => m.type === "despesa").reduce((sum, m) => sum + m.amount, 0);
    const reportNet = reportIncome - reportExpenses;
    const reportPayables = reportRows.filter((m) => m.type === "despesa" && m.status !== "paid").reduce((sum, m) => sum + m.amount, 0);
    const reportReceivables = reportRows.filter((m) => m.type === "receita" && m.status !== "paid").reduce((sum, m) => sum + m.amount, 0);
    const reportPeriodLabel = reportPeriod === "last6" ? "últimos 6 meses" : reportPeriod === "2026-10" ? "outubro de 2026" : "novembro de 2026";
    const expByCategory = categories.map((category) => ({ name: category, total: reportPaidRows.filter((m) => m.type === "despesa" && m.category === category).reduce((sum, m) => sum + m.amount, 0) })).filter((x) => x.total > 0).sort((a, b) => b.total - a.total);
    return <>
      <section className="page-intro"><div><span className="eyebrow">ANÁLISES E DEMONSTRATIVOS</span><h2>Relatórios financeiros</h2><p>Transforme os registros em informação para decidir com segurança.</p></div><div className="report-actions"><select className="filter-select report-period-select" aria-label="Período do relatório" value={reportPeriod} onChange={(event) => setReportPeriod(event.target.value)}><option value="2026-11">Novembro de 2026</option><option value="2026-10">Outubro de 2026</option><option value="last6">Últimos 6 meses</option></select><button className="button-primary" onClick={() => exportCsv(reportRows)}><Download size={16} />Exportar CSV</button></div></section>
      <section className="metrics-grid three-metrics"><MetricCard label="Receitas no período" amount={brl.format(reportIncome)} detail="Lançamentos recebidos" icon={ArrowDownRight} tone="green" /><MetricCard label="Despesas no período" amount={brl.format(reportExpenses)} detail="Lançamentos pagos" icon={ArrowUpRight} tone="amber" /><MetricCard label="Resultado operacional" amount={brl.format(reportNet)} detail="Receitas menos despesas realizadas" icon={CircleDollarSign} tone={reportNet >= 0 ? "green" : "red"} /></section>
      <section className="reports-grid"><article className="panel report-chart"><div className="panel-heading"><div><span className="eyebrow">SÉRIE MENSAL</span><h3>Receitas x despesas</h3><p>Últimos seis meses e projeção</p></div></div><div className="report-area-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={flowChartData.slice(-7, -1)} margin={{ top: 8, right: 6, left: -14, bottom: 0 }} barGap={5}><CartesianGrid vertical={false} stroke="#eceeea" strokeDasharray="3 5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#969e98", fontSize: 11 }} dy={8} /><YAxis tickFormatter={(v) => compactBrl.format(v)} axisLine={false} tickLine={false} tick={{ fill: "#969e98", fontSize: 10 }} width={64} /><ChartTooltip content={<CurrencyTooltip />} /><Bar dataKey="entradas" name="Entradas" fill="#7eaa8d" radius={[5, 5, 0, 0]} maxBarSize={22} /><Bar dataKey="saidas" name="Saídas" fill="#d6b582" radius={[5, 5, 0, 0]} maxBarSize={22} /></BarChart></ResponsiveContainer></div><div className="chart-legend report-legend"><span><i className="legend-dot income-dot" />Receitas</span><span><i className="legend-dot expense-dot" />Despesas</span></div></article><article className="panel report-categories"><div className="panel-heading"><div><span className="eyebrow">NOVEMBRO 2026</span><h3>Demonstrativo por categoria</h3><p>Despesas realizadas no período</p></div></div>{expByCategory.length ? <div className="report-category-list">{expByCategory.map((item, index) => <div key={item.name}><span className="report-category-name"><i style={{ background: categoryColors[index % categoryColors.length] }} />{item.name}</span><div className="report-category-meter"><span style={{ width: `${totalExpenses ? item.total / totalExpenses * 100 : 0}%`, background: categoryColors[index % categoryColors.length] }} /></div><strong>{brl.format(item.total)}</strong></div>)}</div> : <div className="empty-state compact-empty">Ainda não há valores neste período.</div>}</article></section>
      <section className="panel report-summary"><div className="panel-heading"><div><span className="eyebrow">DEMONSTRATIVO</span><h3>Resumo do período · {reportPeriodLabel}</h3><p>Valores realizados, agrupados por tipo de movimentação.</p></div><button className="button-secondary small-button" onClick={() => exportCsv(reportRows)}><Download size={15} />Exportar período</button></div><div className="statement-row"><span>Receitas realizadas <small>{reportPaidRows.filter((m) => m.type === "receita").length} lançamentos</small></span><strong className="positive">{brl.format(reportIncome)}</strong></div><div className="statement-row"><span>Despesas realizadas <small>{reportPaidRows.filter((m) => m.type === "despesa").length} lançamentos</small></span><strong>{brl.format(reportExpenses)}</strong></div><div className="statement-row pending-row"><span>Contas a pagar <small>Valores aguardando pagamento</small></span><strong>{brl.format(reportPayables)}</strong></div><div className="statement-row pending-row"><span>Contas a receber <small>Valores aguardando recebimento</small></span><strong className="positive">{brl.format(reportReceivables)}</strong></div><div className="statement-row statement-total"><span>Resultado líquido realizado</span><strong className={netResult >= 0 ? "positive" : "negative-detail"}>{brl.format(reportNet)}</strong></div></section>
      <p className="data-note"><CircleHelp size={14} />Demonstrativos baseados nos dados locais de exemplo no período selecionado. Exporte o CSV para abrir os registros em uma planilha.</p>
    </>;
  };

  const renderRegistries = () => <>
    <section className="page-intro"><div><span className="eyebrow">ORGANIZAÇÃO FINANCEIRA</span><h2>Contas e categorias</h2><p>Personalize as opções usadas ao criar receitas, despesas e orçamentos.</p></div><button className="button-primary" onClick={openNewMovement}><Plus size={17} />Novo lançamento</button></section>
    <section className="registry-grid"><article className="panel registry-panel"><div className="panel-heading"><div><span className="eyebrow">BANCOS E CAIXA</span><h3>Contas financeiras</h3><p>O saldo de abertura compõe o saldo demonstrativo.</p></div><span className="registry-count">{accounts.length}</span></div><form className="registry-add-row" onSubmit={(e) => { e.preventDefault(); addListValue("account"); }}><input value={newAccount} onChange={(e) => setNewAccount(e.target.value)} placeholder="Nome da conta" aria-label="Nome da nova conta" /><input className="balance-input" type="number" step="0.01" value={accountBalanceDraft} onChange={(e) => setAccountBalanceDraft(e.target.value)} placeholder="Saldo inicial R$" aria-label="Saldo inicial da nova conta" /><button type="submit" className="icon-add-button" aria-label="Adicionar conta"><Plus size={17} /></button></form><div className="registry-list">{accounts.map((account) => { const balance = account.openingBalance + movements.filter((m) => m.status === "paid" && m.date.startsWith(currentMonth) && m.account === account.name).reduce((s, m) => s + (m.type === "receita" ? m.amount : -m.amount), 0); return <div className="registry-item" key={account.id}><span className="registry-icon"><Landmark size={17} /></span><span className="registry-main"><strong>{account.name}</strong><small>{account.bank}</small></span><strong className="registry-balance">{brl.format(balance)}</strong><button className="icon-button danger-icon" onClick={() => removeAccount(account)} aria-label={`Remover ${account.name}`}><Trash2 size={15} /></button></div>; })}</div></article>
      <article className="panel registry-panel"><div className="panel-heading"><div><span className="eyebrow">CLASSIFICAÇÃO</span><h3>Categorias</h3><p>Classifique receitas e despesas.</p></div><span className="registry-count">{categories.length}</span></div><form className="registry-add-row" onSubmit={(e) => { e.preventDefault(); addListValue("category"); }}><input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nova categoria" aria-label="Nova categoria" /><button type="submit" className="icon-add-button" aria-label="Adicionar categoria"><Plus size={17} /></button></form><div className="tag-cloud">{categories.map((item) => <span className="registry-tag" key={item}><i />{item}</span>)}</div></article>
      <article className="panel registry-panel center-registry"><div className="panel-heading"><div><span className="eyebrow">RESPONSABILIDADE</span><h3>Centros de custo</h3><p>Entenda onde os recursos são usados.</p></div><span className="registry-count">{centers.length}</span></div><form className="registry-add-row" onSubmit={(e) => { e.preventDefault(); addListValue("center"); }}><input value={newCenter} onChange={(e) => setNewCenter(e.target.value)} placeholder="Novo centro de custo" aria-label="Novo centro de custo" /><button type="submit" className="icon-add-button" aria-label="Adicionar centro de custo"><Plus size={17} /></button></form><div className="tag-cloud">{centers.map((item) => <span className="registry-tag" key={item}><i />{item}</span>)}</div></article></section>
    <p className="data-note"><CircleHelp size={14} />Cadastros são demonstrações locais. Contas e categorias vinculadas a lançamentos continuam disponíveis no histórico.</p>
  </>;

  const onMovementSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount"));
    if (!amount || amount <= 0) return toast.error("Informe um valor maior que zero.");
    const accountName = String(form.get("account") || accounts[0]?.name || "");
    const category = String(form.get("category") || categories[0] || "Outros");
    const costCenter = String(form.get("costCenter") || centers[0] || "Geral");
    const dueDate = String(form.get("dueDate") || form.get("date"));
    const chosenStatus = String(form.get("status")) as MovementStatus;
    saveMovement({ description: String(form.get("description")).trim(), type: String(form.get("type")) as MovementType, amount, category, account: accountName, costCenter, date: String(form.get("date")), dueDate, status: chosenStatus });
  };

  return <div className="app-shell"><aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}><div className="brand-lockup"><span className="brand-mark"><span /><span /><span /></span><span className="brand-name">finwise<span>.</span></span></div><button className="mobile-close icon-button" onClick={() => setMobileNavOpen(false)} aria-label="Fechar menu"><X size={19} /></button><div className="company-switch"><span className="company-avatar">N</span><span className="company-name"><strong>Norte Studio</strong><small>Empresa demonstrativa</small></span><ChevronDown size={15} /></div><nav className="sidebar-navigation" aria-label="Navegação principal">{["PAINEL", "FINANCEIRO", "GESTÃO"].map((group) => <div className="nav-group" key={group}><span className="nav-group-title">{group}</span>{navItems.filter((item) => item.group === group).map((item) => { const Icon = item.icon; return <button key={item.id} className={`nav-item ${view === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}><Icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{item.id === "contas" && openMovements.length > 0 && <span className="nav-badge">{openMovements.length}</span>}</button>; })}</div>)}</nav><div className="sidebar-bottom"><div className="support-card"><span className="support-icon"><CircleHelp size={16} /></span><strong>Precisa de ajuda?</strong><p>Explore as ferramentas financeiras do FinWise.</p><button onClick={() => toast.info("Central de ajuda demonstrativa.")}>Acessar suporte <ArrowRight size={13} /></button></div><button className="profile-row" onClick={() => toast.info("Área de perfil demonstrativa.")}><span className="profile-avatar">FS</span><span><strong>Financeiro</strong><small>Administrador</small></span><MoreHorizontal size={18} /></button></div></aside>
    {mobileNavOpen && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileNavOpen(false)} />}
    <main className="main-area"><header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" onClick={() => setMobileNavOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{viewTitles[view]}</strong></div></div><div className="topbar-actions"><label className="top-search"><Search size={15} /><input value={search} onChange={(e) => { setSearch(e.target.value); if (e.target.value && view !== "movimentacoes") setView("movimentacoes"); }} placeholder="Buscar movimentações" aria-label="Busca rápida de movimentações" /><kbd>⌘ K</kbd></label><button className="top-icon-button notification-button" onClick={() => navigate("contas")} aria-label="Ver vencimentos"><Bell size={18} />{openMovements.length > 0 && <i />}</button><span className="topbar-divider" /><span className="top-date"><CalendarDays size={15} />Nov, 2026</span></div></header><div className="page-content"><div className="demo-banner"><span><i />MODO DEMONSTRAÇÃO</span><span>Dados locais neste navegador <span className="banner-divider">·</span> Nenhuma conta bancária conectada</span></div>{view === "dashboard" && renderDashboard()}{view === "movimentacoes" && renderMovements()}{view === "contas" && renderAccounts()}{view === "fluxo" && renderFlow()}{view === "orcamentos" && renderBudgets()}{view === "relatorios" && renderReports()}{view === "cadastros" && renderRegistries()}<footer className="page-footer"><span>FinWise · Gestão clara, decisões melhores.</span><span>Ambiente demonstrativo · 2026</span></footer></div></main>
    <Modal open={movementModal} title={editingMovement ? "Editar movimentação" : "Nova movimentação"} onClose={() => { setMovementModal(false); setEditingMovement(null); }} wide><form className="modal-form" onSubmit={onMovementSubmit}><div className="form-intro"><span className="form-step">01</span><p>Preencha os dados do lançamento para manter seu fluxo organizado.</p></div><div className="form-grid"><label className="form-label full-span">Descrição<input required name="description" autoFocus maxLength={100} placeholder="Ex.: Pagamento do fornecedor" defaultValue={editingMovement?.description} /></label><label className="form-label">Tipo de movimentação<select name="type" defaultValue={editingMovement?.type ?? "despesa"}><option value="despesa">Despesa · saída</option><option value="receita">Receita · entrada</option></select></label><label className="form-label">Valor (R$)<input required name="amount" type="number" step="0.01" min="0.01" placeholder="0,00" defaultValue={editingMovement?.amount} /></label><label className="form-label">Categoria<select name="category" defaultValue={editingMovement?.category ?? categories[0]}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-label">Conta financeira<select name="account" defaultValue={editingMovement?.account ?? accounts[0]?.name}>{accounts.map((item) => <option key={item.id}>{item.name}</option>)}</select></label><label className="form-label">Centro de custo<select name="costCenter" defaultValue={editingMovement?.costCenter ?? centers[0]}>{centers.map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-label">Data do lançamento<input required name="date" type="date" defaultValue={editingMovement?.date ?? new Date().toISOString().slice(0, 10)} /></label><label className="form-label">Vencimento<input name="dueDate" type="date" defaultValue={editingMovement?.dueDate ?? editingMovement?.date ?? new Date().toISOString().slice(0, 10)} /></label><label className="form-label">Situação<select name="status" defaultValue={editingMovement?.status ?? "pending"}><option value="pending">Em aberto</option><option value="paid">Pago / recebido</option><option value="overdue">Atrasado</option></select></label></div><div className="modal-disclaimer"><CircleHelp size={15} />Esta movimentação será guardada apenas no armazenamento local deste navegador.</div><div className="modal-footer"><button type="button" className="button-secondary" onClick={() => { setMovementModal(false); setEditingMovement(null); }}>Cancelar</button><button type="submit" className="button-primary"><Check size={16} />{editingMovement ? "Salvar alterações" : "Adicionar lançamento"}</button></div></form></Modal>
    <Modal open={budgetEditor !== null} title={budgetEditor === "new" ? "Novo orçamento" : "Editar orçamento"} onClose={() => setBudgetEditor(null)}><form className="modal-form" onSubmit={saveBudget}><div className="form-grid"><label className="form-label full-span">Planejar por<select value={budgetDimension} onChange={(e) => { const dimension = e.target.value as "Categoria" | "Centro de custo"; setBudgetDimension(dimension); setBudgetLabel((dimension === "Categoria" ? categories[0] : centers[0]) ?? ""); }}><option>Categoria</option><option>Centro de custo</option></select></label><label className="form-label full-span">{budgetDimension}<select value={budgetLabel} onChange={(e) => setBudgetLabel(e.target.value)}>{(budgetDimension === "Categoria" ? categories : centers).map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-label full-span">Valor previsto (R$)<input type="number" min="0.01" step="0.01" required value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} placeholder="0,00" /></label></div><div className="modal-footer"><button type="button" className="button-secondary" onClick={() => setBudgetEditor(null)}>Cancelar</button><button className="button-primary" type="submit"><Check size={16} />Salvar orçamento</button></div></form></Modal>
    </div>;
}
