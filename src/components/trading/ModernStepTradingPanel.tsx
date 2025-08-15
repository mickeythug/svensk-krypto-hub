import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  AlertTriangle,
  Target,
  DollarSign,
  Settings
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { useWalletAuthStatus } from '@/hooks/useWalletAuthStatus';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import ConnectWalletButton from '@/components/web3/ConnectWalletButton';

interface ModernStepTradingPanelProps {
  symbol: string;
  currentPrice: number;
  tokenName: string;
  crypto?: any;
}

type TradingStep = 'select' | 'amount' | 'settings' | 'summary' | 'execute';

const ModernStepTradingPanel: React.FC<ModernStepTradingPanelProps> = ({
  symbol,
  currentPrice,
  tokenName,
  crypto
}) => {
  const { connected: solanaConnected } = useWallet();
  const { isConnected: evmConnected } = useAccount();
  const { fullyAuthed } = useWalletAuthStatus();
  const { isAuthenticated: supabaseAuthed } = useSupabaseAuth();
  const { t } = useLanguage();

  // Trading state
  const [currentStep, setCurrentStep] = useState<TradingStep>('select');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState([0.5]);
  const [tip, setTip] = useState([0]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Combined authentication status
  const isFullyAuthenticated = fullyAuthed && supabaseAuthed;
  const isConnected = solanaConnected || evmConnected;
  
  // Detect chain based on connection
  const currentChain = solanaConnected ? 'SOL' : evmConnected ? 'ETH' : '';
  const baseCurrency = currentChain === 'SOL' ? 'SOL' : 'USDT';
  
  // Mock balances
  const mockBalances = {
    sol: 2.5,
    usdt: 1250.00,
    [symbol.toLowerCase()]: 0.0
  };

  // Calculate totals
  const calculateTotal = () => {
    const amountNum = parseFloat(amount) || 0;
    const priceWithSlippage = side === 'buy' 
      ? currentPrice * (1 + slippage[0] / 100)
      : currentPrice * (1 - slippage[0] / 100);
    const subtotal = amountNum * priceWithSlippage;
    const tipAmount = subtotal * (tip[0] / 100);
    return subtotal + tipAmount;
  };

  const fees = {
    trading: calculateTotal() * 0.001,
    network: currentChain === 'SOL' ? 0.001 : 0.005,
    tip: calculateTotal() * (tip[0] / 100)
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep === 'select') setCurrentStep('amount');
    else if (currentStep === 'amount') setCurrentStep('settings');
    else if (currentStep === 'settings') setCurrentStep('summary');
    else if (currentStep === 'summary') setCurrentStep('execute');
  };

  const prevStep = () => {
    if (currentStep === 'amount') setCurrentStep('select');
    else if (currentStep === 'settings') setCurrentStep('amount');
    else if (currentStep === 'summary') setCurrentStep('settings');
    else if (currentStep === 'execute') setCurrentStep('summary');
  };

  const resetWizard = () => {
    setCurrentStep('select');
    setAmount('');
    setSlippage([0.5]);
    setTip([0]);
  };

  const executeTrade = async () => {
    setIsLoading(true);
    try {
      console.log('Executing trade:', {
        symbol,
        side,
        amount: parseFloat(amount),
        currentPrice,
        slippage: slippage[0],
        tip: tip[0],
        total: calculateTotal(),
        chain: currentChain
      });
      
      // Simulate trade execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset after successful trade
      resetWizard();
    } catch (error) {
      console.error('Trade execution failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Step indicator
  const steps = ['select', 'amount', 'settings', 'summary'];
  const stepIndex = steps.indexOf(currentStep);

  // Always show the trading panel interface

  return (
    <Card className="h-full max-h-[600px] bg-gray-800/30 border-gray-700/30 p-6 flex flex-col"
      style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">{t('trading.trade')} {symbol}</h3>
          <p className="text-sm text-gray-400">{t('trading.currentPrice')}: ${currentPrice.toFixed(6)}</p>
        </div>
        <div className="text-sm text-gray-400">
          {currentChain} Chain
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                index <= stepIndex
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {index < stepIndex ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  index < stepIndex ? 'bg-primary' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 space-y-4">
        
        {/* Step 1: Select Buy/Sell */}
        {currentStep === 'select' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">1. {t('trading.orderType')}</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={side === 'buy' ? 'default' : 'outline'}
                onClick={() => setSide('buy')}
                className={`h-16 font-bold text-lg ${
                  side === 'buy' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                {t('trading.buy')}
              </Button>
              <Button
                variant={side === 'sell' ? 'default' : 'outline'}
                onClick={() => setSide('sell')}
                className={`h-16 font-bold text-lg ${
                  side === 'sell' 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <TrendingDown className="h-5 w-5 mr-2" />
                {t('trading.sell')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Amount */}
        {currentStep === 'amount' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">
              2. {t('trading.amount')} ({baseCurrency})
            </h4>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">
                {side === 'buy' ? `${t('trading.amount')} to spend` : `${t('trading.amount')} to sell`} ({baseCurrency})
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-900/50 border-gray-600/50 text-white text-lg h-12"
              />
              
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((percent) => (
                  <Button
                    key={percent}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const maxAmount = side === 'buy' 
                        ? mockBalances[baseCurrency.toLowerCase()]
                        : mockBalances[symbol.toLowerCase()];
                      const calculatedAmount = (maxAmount * percent) / 100;
                      setAmount(calculatedAmount.toFixed(6));
                    }}
                    className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 text-xs"
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
              
              <div className="text-xs text-gray-400 text-center">
                {t('trading.available')}: {
                  side === 'buy' 
                    ? `${mockBalances[baseCurrency.toLowerCase()].toFixed(4)} ${baseCurrency}`
                    : `${mockBalances[symbol.toLowerCase()].toFixed(6)} ${symbol}`
                }
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Settings */}
        {currentStep === 'settings' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">
              3. {t('trading.slippage')} & {t('trading.tip')}
            </h4>
            
            {/* Slippage */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-400" />
                <Label className="text-sm font-medium text-gray-300">
                  {t('trading.slippage')}: {slippage[0]}%
                </Label>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[0.1, 0.5, 1.0].map((preset) => (
                  <Button
                    key={preset}
                    variant={slippage[0] === preset ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSlippage([preset])}
                    className={`${
                      slippage[0] === preset 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-700/50 border-gray-600 text-gray-300'
                    }`}
                  >
                    {preset}%
                  </Button>
                ))}
              </div>
              
              <Slider
                value={slippage}
                onValueChange={setSlippage}
                max={5}
                min={0.1}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Tip */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <Label className="text-sm font-medium text-gray-300">
                  {t('trading.tip')}: {tip[0]}%
                </Label>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[0, 0.01, 0.05, 0.1].map((preset) => (
                  <Button
                    key={preset}
                    variant={tip[0] === preset ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTip([preset])}
                    className={`text-xs ${
                      tip[0] === preset 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-700/50 border-gray-600 text-gray-300'
                    }`}
                  >
                    {preset}%
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 'summary' && (
          <>
            {!isFullyAuthenticated ? (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-4">
                  4. {t('trading.orderSummary')}
                </h4>
                
                <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t('trading.orderType')}:</span>
                    <span className="text-white font-medium capitalize">{side} {symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t('trading.amount')}:</span>
                    <span className="text-white font-mono">{amount || '0'} {baseCurrency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t('trading.estimatedPrice')}:</span>
                    <span className="text-white font-mono">
                      ${(currentPrice * (1 + (side === 'buy' ? slippage[0] : -slippage[0]) / 100)).toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t('trading.slippage')}:</span>
                    <span className="text-white font-mono">{slippage[0]}%</span>
                  </div>
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-300">{t('trading.total')}:</span>
                      <span className="text-white font-mono text-lg">${calculateTotal().toFixed(4)}</span>
                    </div>
                  </div>
                </div>

                {/* Connect Wallet to Continue */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
                  <AlertTriangle className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-yellow-200 mb-3">
                    {t('trading.connectWalletMessage')}
                  </p>
                  <ConnectWalletButton />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-4">
                  4. {t('trading.orderSummary')}
                </h4>
                
                <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t('trading.orderType')}:</span>
                    <span className="text-white font-medium capitalize">{side} {symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t('trading.amount')}:</span>
                    <span className="text-white font-mono">{amount || '0'} {baseCurrency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t('trading.estimatedPrice')}:</span>
                    <span className="text-white font-mono">
                      ${(currentPrice * (1 + (side === 'buy' ? slippage[0] : -slippage[0]) / 100)).toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t('trading.slippage')}:</span>
                    <span className="text-white font-mono">{slippage[0]}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t('trading.tradingFee')}:</span>
                    <span className="text-white font-mono">${fees.trading.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Network Fee:</span>
                    <span className="text-white font-mono">${fees.network.toFixed(4)}</span>
                  </div>
                  {tip[0] > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{t('trading.tip')}:</span>
                      <span className="text-white font-mono">${fees.tip.toFixed(4)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-300">{t('trading.total')}:</span>
                      <span className="text-white font-mono text-lg">${calculateTotal().toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 5: Execute */}
        {currentStep === 'execute' && (
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              {isLoading ? (
                <>
                  <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <h4 className="text-lg font-semibold text-white">Executing Trade...</h4>
                  <p className="text-sm text-gray-400">Please confirm in your wallet</p>
                </>
              ) : (
                <>
                  <Check className="h-12 w-12 text-emerald-400 mx-auto" />
                  <h4 className="text-lg font-semibold text-white">Trade Executed!</h4>
                  <p className="text-sm text-gray-400">Your {side} order has been processed</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-6">
        {currentStep !== 'select' && currentStep !== 'execute' && (
          <Button
            variant="outline"
            onClick={prevStep}
            className="flex-1 bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        )}
        
        {currentStep === 'select' && (
          <Button
            onClick={nextStep}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            {t('common.continue')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        
        {currentStep === 'amount' && (
          <Button
            onClick={nextStep}
            disabled={!amount || parseFloat(amount) <= 0}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold disabled:opacity-50"
          >
            {t('common.continue')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        
        {currentStep === 'settings' && (
          <Button
            onClick={nextStep}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            {t('trading.orderSummary')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        
        {currentStep === 'summary' && !isFullyAuthenticated && (
          <Button
            onClick={() => {}}
            disabled={true}
            className="flex-1 bg-gray-600 text-gray-400 cursor-not-allowed"
          >
            {t('trading.connectWalletMessage')}
          </Button>
        )}
        
        {currentStep === 'summary' && isFullyAuthenticated && (
          <Button
            onClick={() => {
              setCurrentStep('execute');
              executeTrade();
            }}
            className={`flex-1 font-bold ${
              side === 'buy'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-red-600 hover:bg-red-700'
            } text-white`}
          >
            <Zap className="h-4 w-4 mr-2" />
            {side === 'buy' ? t('trading.buy') : t('trading.sell')} {symbol}
          </Button>
        )}
        
        {currentStep === 'execute' && !isLoading && (
          <Button
            onClick={resetWizard}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            {t('trading.newTrade')}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ModernStepTradingPanel;