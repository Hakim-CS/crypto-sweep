
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, Globe, ArrowLeft, ArrowRight, BookOpenCheck, Lightbulb, Trophy } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';

export default function Education() {
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState<string>("glossary");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
      icon: <BookOpenCheck className="h-6 w-6 text-green-500" />,
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
      icon: <Trophy className="h-6 w-6 text-amber-500" />,
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
      icon: <Lightbulb className="h-6 w-6 text-blue-500" />,
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

  // Educational images for the slider
  const educationalImages = [
    {
      src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      alt: "Coding on computer",
      caption: "Blockchain Development"
    },
    {
      src: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
      alt: "Person using laptop",
      caption: "Learning Cryptocurrency Trading"
    },
    {
      src: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      alt: "Circuit board",
      caption: "The Technology Behind Crypto"
    }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % educationalImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + educationalImages.length) % educationalImages.length);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{t('educationalResources')}</h1>
        <p className="text-xl text-muted-foreground mb-8">{t('learnAboutCrypto')}</p>
      </div>

      {/* Image Slider */}
      <div className="relative w-full h-64 md:h-96 mb-8 overflow-hidden rounded-lg shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20"></div>
        <img 
          src={educationalImages[currentImageIndex].src} 
          alt={educationalImages[currentImageIndex].alt}
          className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
          <p className="text-xl font-semibold">{educationalImages[currentImageIndex].caption}</p>
        </div>
        <button 
          onClick={prevImage} 
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition"
          aria-label="Previous image"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={nextImage} 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition"
          aria-label="Next image"
        >
          <ArrowRight className="h-6 w-6" />
        </button>
        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-2 p-2">
          {educationalImages.map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <Card className="mb-8 overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardTitle className="text-2xl">{t('educationalResources')}</CardTitle>
          <CardDescription className="text-white/90">{t('learnAboutCrypto')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="glossary" value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b p-0">
              <TabsTrigger value="glossary" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-4 px-6">
                <BookOpen className="mr-2 h-4 w-4" />
                {t('cryptoGlossary')}
              </TabsTrigger>
              <TabsTrigger value="strategies" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-4 px-6">
                <TrendingUp className="mr-2 h-4 w-4" />
                {t('tradingStrategies')}
              </TabsTrigger>
              <TabsTrigger value="news" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-4 px-6">
                <Globe className="mr-2 h-4 w-4" />
                {t('newsSources')}
              </TabsTrigger>
            </TabsList>
            
            <div className="p-6">
              <TabsContent value="glossary" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {glossaryTerms.map((item, index) => (
                    <Card key={index} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                      <CardHeader className="py-3 bg-gradient-to-r from-gray-50 to-gray-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          {item.term}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-3">
                        <p>{t(item.definitionKey)}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="strategies" className="mt-0">
                {tradingStrategies.map((strategy, index) => (
                  <Card key={index} className="mb-4 overflow-hidden hover:shadow-md transition-all">
                    <CardHeader className="pb-2 flex flex-row items-center gap-2">
                      {strategy.icon}
                      <div>
                        <CardTitle>{strategy.title}</CardTitle>
                        <CardDescription>{t(strategy.descriptionKey)}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2">
                        {strategy.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-left pl-2 py-1 border-l-2 border-gray-200">{t(step.key)}</li>
                        ))}
                      </ol>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="ml-auto">
                        {t('learnMore')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="news" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {newsSources.map((source, index) => (
                    <Card key={index} className="overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg">
                      <CardHeader className="py-3 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <CardTitle className="text-lg">{source.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="py-3">
                        <p className="mb-4 text-sm text-gray-600">{source.description}</p>
                      </CardContent>
                      <CardFooter className="pt-0 pb-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => window.open(source.url, '_blank')}
                        >
                          {t('visitSite')}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
