
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, Globe } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';

export default function Education() {
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState<string>("glossary");

  // Dictionary of crypto terms for the glossary
  const glossaryTerms = [
    { term: "Blockchain", definitionKey: "blockchain" },
    { term: "Cryptocurrency", definitionKey: "cryptocurrency" },
    { term: "Bitcoin (BTC)", definitionKey: "bitcoin" },
    { term: "Ethereum (ETH)", definitionKey: "ethereum" },
    { term: "Altcoin", definitionKey: "altcoin" },
    { term: "Mining", definitionKey: "mining" },
    { term: "Wallet", definitionKey: "wallet" },
    { term: "DeFi", definitionKey: "defi" },
    { term: "NFT", definitionKey: "nft" },
    { term: "HODL", definitionKey: "hodl" }
  ];

  // Trading strategies tutorials
  const tradingStrategies = [
    {
      title: "Dollar-Cost Averaging",
      descriptionKey: "dollarCostAveraging",
      steps: [
        { key: "step1DCA" },
        { key: "step2DCA" },
        { key: "step3DCA" },
        { key: "step4DCA" }
      ]
    },
    {
      title: "HODL Strategy",
      descriptionKey: "hodlStrategy",
      steps: [
        { key: "step1HODL" },
        { key: "step2HODL" },
        { key: "step3HODL" },
        { key: "step4HODL" }
      ]
    },
    {
      title: "Swing Trading",
      descriptionKey: "swingTrading",
      steps: [
        { key: "step1Swing" },
        { key: "step2Swing" },
        { key: "step3Swing" },
        { key: "step4Swing" }
      ]
    }
  ];

  // Crypto news sources
  const newsSources = [
    {
      name: "CoinDesk",
      description: "One of the leading news sites for blockchain and cryptocurrency news.",
      url: "https://www.coindesk.com/"
    },
    {
      name: "CryptoSlate",
      description: "News aggregator covering cryptocurrency news, information and analysis.",
      url: "https://cryptoslate.com/"
    },
    {
      name: "Cointelegraph",
      description: "Leading independent digital media resource covering news on blockchain, crypto assets, and emerging fintech trends.",
      url: "https://cointelegraph.com/"
    },
    {
      name: "The Block",
      description: "Leading research, analysis and news organization covering digital assets.",
      url: "https://www.theblock.co/"
    },
    {
      name: "Decrypt",
      description: "Demystifies the decentralized web with news, guides, and explainers.",
      url: "https://decrypt.co/"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{t('educationalResources')}</h1>
        <p className="text-xl text-muted-foreground mb-8">{t('learnAboutCrypto')}</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{t('educationalResources')}</CardTitle>
          <CardDescription>{t('learnAboutCrypto')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="glossary" value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="glossary">
                <BookOpen className="mr-2 h-4 w-4" />
                {t('cryptoGlossary')}
              </TabsTrigger>
              <TabsTrigger value="strategies">
                <TrendingUp className="mr-2 h-4 w-4" />
                {t('tradingStrategies')}
              </TabsTrigger>
              <TabsTrigger value="news">
                <Globe className="mr-2 h-4 w-4" />
                {t('newsSources')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="glossary" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {glossaryTerms.map((item, index) => (
                  <Card key={index}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-lg">{item.term}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p>{t(item.definitionKey)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="strategies" className="space-y-4">
              {tradingStrategies.map((strategy, index) => (
                <Card key={index} className="mb-4">
                  <CardHeader>
                    <CardTitle>{strategy.title}</CardTitle>
                    <CardDescription>{t(strategy.descriptionKey)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2">
                      {strategy.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-left">{t(step.key)}</li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="news" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {newsSources.map((source, index) => (
                  <Card key={index}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="mb-4">{source.description}</p>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.open(source.url, '_blank')}
                      >
                        {t('visitSite')}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
