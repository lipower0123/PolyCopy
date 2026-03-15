import React, { useState } from 'react';
import { 
  Activity, 
  Target, 
  Zap, 
  TrendingUp, 
  Users, 
  Settings, 
  Plus, 
  Search,
  Play,
  Square,
  ChevronRight,
  BarChart3,
  X
} from 'lucide-react';

// Mock Data
const INITIAL_SMART_MONEY = [
  { id: '0x71a...9b2e', name: 'Whale_01', roi: '+145.2%', winRate: '68%', active: 12, category: 'Politics', isCustom: false },
  { id: '0x22f...4c1a', name: 'CryptoOracle', roi: '+89.4%', winRate: '72%', active: 5, category: 'Crypto', isCustom: false },
  { id: '0x99d...11aa', name: 'SportsBettor', roi: '+42.1%', winRate: '55%', active: 8, category: 'Sports', isCustom: false },
  { id: '0x44b...88cc', name: 'MacroFund', roi: '+210.5%', winRate: '81%', active: 3, category: 'Pop Culture', isCustom: false },
];

const ACTIVE_BOTS = [
  { id: 1, target: '0x71a...9b2e', status: 'running', allocation: '$50 / trade', pnl: '+$124.50', trades: 14 },
  { id: 2, target: 'CryptoOracle', status: 'paused', allocation: '10% of balance', pnl: '-$12.00', trades: 2 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [smartMoney, setSmartMoney] = useState<any[]>([]);
  const [stats, setStats] = useState({ monitoredWallets: 0, volume24h: '-', topCategory: '-' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletName, setNewWalletName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  React.useEffect(() => {
    setIsLoading(true);
    fetch('/api/smart-money')
      .then(res => res.json())
      .then(data => {
        setSmartMoney(data.smartMoney || []);
        if (data.stats) setStats(data.stats);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch smart money:', err);
        setIsLoading(false);
      });
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error("User rejected request", error);
      }
    } else {
      // In iframe preview, window.ethereum might not be available.
      // We'll simulate a connection for demo purposes if no wallet is found.
      setWalletAddress('0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''));
    }
  };

  const handleCopyTrade = async (traderName: string, market: string) => {
    try {
      // In a real scenario, you'd pass the actual market ID and outcome index
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketId: "0x" + Math.random().toString(16).slice(2, 10), // Mock market ID
          outcomeIndex: 0,
          amount: "10" // Default $10 for copy trade
        })
      });
      
      const result = await response.json();
      if (result.simulated) {
        alert(`[模拟模式] 成功跟单 ${traderName} 在 ${market} 的交易！\n(请导出项目并在 .env 中配置真实密钥以开启实盘交易)`);
      } else {
        alert(`[实盘模式] 成功跟单 ${traderName}！`);
      }
    } catch (error) {
      console.error("Trade failed:", error);
      alert("跟单失败，请检查网络或后端日志。");
    }
  };

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletAddress) return;

    const newEntry = {
      id: newWalletAddress.length > 10 ? `${newWalletAddress.slice(0, 5)}...${newWalletAddress.slice(-4)}` : newWalletAddress,
      name: newWalletName || 'Custom Watch',
      roi: '0.0%', // Initial mock data for new wallet
      winRate: '0%',
      active: 0,
      category: 'Unknown',
      isCustom: true
    };

    setSmartMoney([newEntry, ...smartMoney]);
    setIsAddModalOpen(false);
    setNewWalletAddress('');
    setNewWalletName('');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-xl flex flex-col z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">PolyCopy<span className="text-blue-500">.</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('discover')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'discover' ? 'bg-blue-600/10 text-blue-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'}`}
          >
            <Search className="w-5 h-5" />
            <span className="font-medium">发现机会 (Discover)</span>
          </button>
          <button 
            onClick={() => setActiveTab('bots')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'bots' ? 'bg-blue-600/10 text-blue-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'}`}
          >
            <Zap className="w-5 h-5" />
            <span className="font-medium">自动跟单 (Bots)</span>
          </button>
          <button 
            onClick={() => setActiveTab('pnl')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'pnl' ? 'bg-blue-600/10 text-blue-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">我的收益 (PnL)</span>
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-blue-600/10 text-blue-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">设置 (Settings)</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {activeTab === 'discover' && '聪明钱雷达 (Smart Money Radar)'}
              {activeTab === 'bots' && '我的跟单机器人 (My Bots)'}
              {activeTab === 'pnl' && '收益分析 (PnL Analytics)'}
              {activeTab === 'settings' && '系统设置 (Settings)'}
            </h1>
            <p className="text-zinc-400 mt-2">
              {activeTab === 'discover' && '监控 Polymarket 上的高胜率地址和热门赛道。'}
              {activeTab === 'bots' && '管理您的自动化交易策略和风险控制。'}
              {activeTab === 'pnl' && '查看所有跟单机器人的历史收益表现。'}
              {activeTab === 'settings' && '配置 Polymarket API 密钥和全局风控参数。'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Polygon RPC Connected
            </div>
            <button 
              onClick={connectWallet}
              className="px-5 py-2.5 bg-zinc-100 text-zinc-950 font-semibold rounded-xl hover:bg-white transition-colors"
            >
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
            </button>
          </div>
        </header>

        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Users className="w-5 h-5" /></div>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">+12%</span>
                </div>
                <h3 className="text-3xl font-bold mt-4">{stats.monitoredWallets.toLocaleString()}</h3>
                <p className="text-zinc-400 text-sm mt-1">监控地址总数 (Monitored Wallets)</p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><TrendingUp className="w-5 h-5" /></div>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">+5%</span>
                </div>
                <h3 className="text-3xl font-bold mt-4">{stats.volume24h}</h3>
                <p className="text-zinc-400 text-sm mt-1">24h 聪明钱交易量 (Smart Money Vol)</p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400"><Activity className="w-5 h-5" /></div>
                </div>
                <h3 className="text-3xl font-bold mt-4 truncate" title={stats.topCategory}>{stats.topCategory}</h3>
                <p className="text-zinc-400 text-sm mt-1">当前最热赛道 (Top Category)</p>
              </div>
            </div>

            {/* Table Header Actions */}
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-semibold">监控列表 (Watchlist)</h2>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl font-medium transition-colors flex items-center gap-2 border border-zinc-700"
              >
                <Plus className="w-4 h-4" />
                添加观察地址
              </button>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900/30">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <div className="flex gap-2">
                  <select className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-300 outline-none focus:border-blue-500 transition-colors">
                    <option>All Categories</option>
                    <option>Politics</option>
                    <option>Crypto</option>
                  </select>
                  <select className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-300 outline-none focus:border-blue-500 transition-colors">
                    <option>30 Days</option>
                    <option>7 Days</option>
                    <option>All Time</option>
                  </select>
                </div>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-sm text-zinc-400">
                    <th className="p-4 font-medium">钱包地址 (Wallet)</th>
                    <th className="p-4 font-medium">偏好赛道 (Category)</th>
                    <th className="p-4 font-medium">最新持仓 (Latest Position)</th>
                    <th className="p-4 font-medium">胜率 (Win Rate)</th>
                    <th className="p-4 font-medium">30天收益 (30d ROI)</th>
                    <th className="p-4 font-medium text-right">操作 (Action)</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          正在同步 Polymarket 链上数据...
                        </div>
                      </td>
                    </tr>
                  ) : smartMoney.map((trader, i) => (
                    <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${trader.isCustom ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                            {trader.isCustom ? 'C' : ''}
                          </div>
                          <div>
                            <div className="font-medium text-zinc-100 flex items-center gap-2">
                              {trader.name}
                              {trader.isCustom && <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">Custom</span>}
                            </div>
                            <div className="text-zinc-500 text-xs font-mono">{trader.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-300">
                        <span className="px-2 py-1 bg-zinc-800 rounded-md text-xs">{trader.category}</span>
                      </td>
                      <td className="p-4 text-zinc-300 max-w-[200px] truncate" title={trader.currentBet}>
                        {trader.currentBet || '-'}
                      </td>
                      <td className="p-4 text-zinc-100 font-medium">{trader.winRate}</td>
                      <td className={`p-4 font-medium ${trader.roi.startsWith('+') ? 'text-emerald-400' : trader.roi === '0.0%' ? 'text-zinc-500' : 'text-red-400'}`}>{trader.roi}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleCopyTrade(trader.name, trader.currentBet)}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 ml-auto"
                        >
                          <Zap className="w-4 h-4" />
                          一键跟单
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bots' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20">
                <Plus className="w-5 h-5" />
                创建新机器人 (Create Bot)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {ACTIVE_BOTS.map((bot) => (
                <div key={bot.id} className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${bot.status === 'running' ? 'bg-emerald-500' : 'bg-zinc-600'}`}></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold">Copy: {bot.target}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${bot.status === 'running' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                          {bot.status}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm">Polymarket CLOB API</p>
                    </div>
                    <div className="flex gap-2">
                      {bot.status === 'running' ? (
                        <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors" title="Pause Bot">
                          <Square className="w-4 h-4" />
                        </button>
                      ) : (
                        <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors" title="Start Bot">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors" title="Settings">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-zinc-800/50 mb-4">
                    <div>
                      <div className="text-zinc-500 text-xs mb-1">单笔投入 (Allocation)</div>
                      <div className="font-medium">{bot.allocation}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-xs mb-1">已跟单 (Trades)</div>
                      <div className="font-medium">{bot.trades}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-xs mb-1">总收益 (PnL)</div>
                      <div className={`font-medium ${bot.pnl.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{bot.pnl}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">风控: 最大滑点 2%, 止损 20%</span>
                    <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
                      查看日志 <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pnl' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="text-zinc-400 text-sm mb-2">总收益 (Total PnL)</div>
                <h3 className="text-3xl font-bold text-emerald-400">+$1,245.80</h3>
                <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[75%]"></div>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 mt-2">
                  <span>Win: 42</span>
                  <span>Loss: 14</span>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="text-zinc-400 text-sm mb-2">胜率 (Overall Win Rate)</div>
                <h3 className="text-3xl font-bold text-zinc-100">75.0%</h3>
                <p className="text-emerald-400 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> +5.2% vs last month
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="text-zinc-400 text-sm mb-2">最佳表现机器人 (Top Bot)</div>
                <h3 className="text-xl font-bold text-zinc-100 truncate">Copy: Whale_01</h3>
                <p className="text-emerald-400 text-sm mt-2">+$840.50 (67% of total)</p>
              </div>
            </div>

            <div className="p-12 rounded-2xl border border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center text-center">
              <BarChart3 className="w-16 h-16 text-zinc-700 mb-4" />
              <h3 className="text-xl font-medium text-zinc-300 mb-2">详细图表即将推出</h3>
              <p className="text-zinc-500 max-w-md">
                我们正在集成更详细的收益曲线图和历史订单分析功能，敬请期待。
              </p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-8">
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Polymarket API 凭证</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  用于执行自动跟单操作。请确保您的 API Key 具有交易权限。这些凭证将加密存储在后端。
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">API Key</label>
                    <input 
                      type="password" 
                      placeholder="Enter your Polymarket API Key" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">API Secret / Passphrase</label>
                    <input 
                      type="password" 
                      placeholder="Enter your API Secret" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">全局风控设置 (Global Risk Control)</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  这些设置将作为所有跟单机器人的默认安全底线。
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div>
                      <div className="font-medium text-zinc-200">最大允许滑点 (Max Slippage)</div>
                      <div className="text-zinc-500 text-sm">如果价格变动超过此百分比，将放弃跟单。</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" defaultValue={2.0} className="w-20 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-center text-zinc-100 focus:outline-none focus:border-blue-500" />
                      <span className="text-zinc-400">%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div>
                      <div className="font-medium text-zinc-200">单日最大亏损 (Daily Stop Loss)</div>
                      <div className="text-zinc-500 text-sm">当日累计亏损达到此金额时，暂停所有机器人。</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">$</span>
                      <input type="number" defaultValue={100} className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-center text-zinc-100 focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-900/20">
                保存所有设置
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Wallet Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h3 className="text-xl font-bold">添加观察地址</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddWallet} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  钱包地址 (Polygon Address) <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  placeholder="0x..." 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  备注名称 (Alias)
                </label>
                <input 
                  type="text" 
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  placeholder="e.g., Smart Money 01" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  disabled={!newWalletAddress}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

