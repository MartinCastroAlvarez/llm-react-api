import { AnalysisResponse, CharacterNode, InteractionEdge, Quote } from './types';

const characterNames = [
  'Elizabeth Bennet',
  'Mr. Darcy',
  'Jane Bennet',
  'Mr. Bingley',
  'Lydia Bennet',
  'Mr. Wickham',
  'Charlotte Lucas',
  'Mr. Collins',
  'Mrs. Bennet',
  'Mr. Bennet',
  'Lady Catherine',
  'Mary Bennet',
  'Kitty Bennet',
  'Caroline Bingley',
  'Colonel Fitzwilliam',
  'Mrs. Phillips',
  'Sir William Lucas',
  'Maria Lucas',
  'Mrs. Gardiner',
  'Mr. Gardiner',
  'Georgiana Darcy',
  'Mrs. Reynolds',
  'Lady Anne de Bourgh',
  'Mrs. Hurst',
  'Mr. Hurst',
  'Captain Carter',
  'Mrs. Long',
  'Miss King',
  'Mrs. Hill',
  'John the Butler',
];

const quoteTemplates = [
  'I must confess, {target}, your presence brings both comfort and confusion to my heart.',
  'In all my years, I have never met someone quite like {target}.',
  'The very thought of {target} fills me with indescribable emotions.',
  'My dear {target}, you cannot imagine the effect you have on those around you.',
  'If only {target} knew the truth of my feelings.',
  'There are few people whom I really love, and {target} is among them.',
  'The more I see of {target}, the more I am bewildered.',
  "I could easily forgive {target}'s pride, if they had not mortified mine.",
  'My good opinion of {target}, once lost, is lost forever.',
  'I cannot fix the hour, or the spot, or the look, or the words, which laid the foundation of my regard for {target}.',
  'To be fond of {target} is something every young person must experience.',
  'What a wonderful discovery it has been to know {target}.',
  'I dare say {target} has quite changed my perspective on many things.',
  'One cannot know what to think of {target}, so full of contradictions.',
  'I find myself thinking of {target} at the most unexpected moments.',
  'There is a stubbornness about me that never can bear to be frightened at the will of {target}.',
  'Till this moment I never knew myself, nor my feelings towards {target}.',
  'I have been used to consider {target} as one of the handsomest persons of my acquaintance.',
  'A person may be proud without being vain, and {target} certainly is.',
  'I could not have been more wretchedly blind to the true nature of {target}.',
  'It is particularly incumbent on those who never change their opinion, to be secure of judging properly at first about {target}.',
  'My feelings towards {target} are quite unlike anything I have experienced before.',
  'I am determined that nothing but the very deepest love could ever induce me to marry {target}.',
  'I have not the pleasure of understanding {target} at times.',
  'What a difference there is between {target} and what I once thought!',
];

function generateQuotes(characters: CharacterNode[]): Quote[] {
  const quotes: Quote[] = [];

  characters.forEach((character) => {
    // Reduced probability to 30% chance (from 50%)
    if (Math.random() < 0.3) {
      // Get random characters to mention in the quote (excluding self)
      const otherCharacters = characters.filter((c) => c.id !== character.id);
      const targetCharacter = otherCharacters[Math.floor(Math.random() * otherCharacters.length)];

      // Select random quote template and replace placeholder
      const template = quoteTemplates[Math.floor(Math.random() * quoteTemplates.length)];
      const quoteText = template.replace('{target}', targetCharacter.name);

      quotes.push({
        characterId: character.id,
        characterName: character.name,
        text: quoteText,
        sentiment: Math.floor(Math.random() * 101), // 0 to 100
      });
    }
  });

  return quotes;
}

export function generateProcessingGraph(): AnalysisResponse {
  // 15% chance to return processed status instead
  if (Math.random() < 0.15) {
    return generateRandomGraph();
  }

  // Generate small number of characters (between 2 and 4)
  const numCharacters = Math.floor(Math.random() * 3) + 2;

  // Shuffle and select random characters
  const shuffledNames = [...characterNames].sort(() => Math.random() - 0.5);
  const selectedNames = shuffledNames.slice(0, numCharacters);

  // Create nodes
  const nodes: CharacterNode[] = selectedNames.map((name, index) => ({
    id: (index + 1).toString(),
    name,
  }));

  // Generate few random interactions (1-2 per character)
  const edges: InteractionEdge[] = [];
  // Select a central character for the small processing graph
  const centralCharIdx = Math.floor(Math.random() * nodes.length);

  nodes.forEach((_, idx) => {
    if (idx === centralCharIdx) {
      // Central character connects to 1-2 others
      const numConnections = Math.floor(Math.random() * 2) + 1;
      const possibleTargets = nodes.filter((_, i) => i !== idx);
      const targets = [...possibleTargets]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(numConnections, possibleTargets.length));

      targets.forEach((target) => {
        edges.push({
          source: nodes[idx].id,
          target: target.id,
          weight: Math.floor(Math.random() * 20) + 1,
        });
      });
    } else if (Math.random() < 0.3) {
      // Only 30% of other characters get additional connections
      const target = nodes[centralCharIdx];
      edges.push({
        source: nodes[idx].id,
        target: target.id,
        weight: Math.floor(Math.random() * 20) + 1,
      });
    }
  });

  return {
    status: 'processing',
    graph: { nodes, edges },
    quotes: generateQuotes(nodes),
  };
}

export function generateRandomGraph(): AnalysisResponse {
  // Generate larger number of characters (between 10 and 15)
  const numCharacters = Math.floor(Math.random() * 6) + 10;

  // Shuffle and select random characters
  const shuffledNames = [...characterNames].sort(() => Math.random() - 0.5);
  const selectedNames = shuffledNames.slice(0, numCharacters);

  // Create nodes
  const nodes: CharacterNode[] = selectedNames.map((name, index) => ({
    id: (index + 1).toString(),
    name,
  }));

  // Select 2-3 central characters to act as hubs
  const numHubs = Math.floor(Math.random() * 2) + 2;
  const hubIndices = new Set<number>();
  while (hubIndices.size < numHubs) {
    hubIndices.add(Math.floor(Math.random() * nodes.length));
  }

  // Generate clustered interactions
  const edges: InteractionEdge[] = [];
  nodes.forEach((_, idx) => {
    if (hubIndices.has(idx)) {
      // Hub characters connect to 3-5 others
      const numConnections = Math.floor(Math.random() * 3) + 3;
      const possibleTargets = nodes.filter((_, i) => i !== idx && !hubIndices.has(i));
      const targets = [...possibleTargets]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(numConnections, possibleTargets.length));

      targets.forEach((target) => {
        edges.push({
          source: nodes[idx].id,
          target: target.id,
          weight: Math.floor(Math.random() * 80) + 20,
        });
      });
    } else {
      // Non-hub characters have a 40% chance to connect to another non-hub
      if (Math.random() < 0.4) {
        const possibleTargets = nodes.filter((_, i) => i !== idx && !hubIndices.has(i));
        if (possibleTargets.length > 0) {
          const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
          edges.push({
            source: nodes[idx].id,
            target: target.id,
            weight: Math.floor(Math.random() * 40) + 10,
          });
        }
      }

      // Connect to 1-2 random hubs
      const numHubConnections = Math.floor(Math.random() * 2) + 1;
      const hubNodes = [...hubIndices].sort(() => Math.random() - 0.5).slice(0, numHubConnections);
      hubNodes.forEach((hubIdx) => {
        edges.push({
          source: nodes[idx].id,
          target: nodes[hubIdx].id,
          weight: Math.floor(Math.random() * 80) + 20,
        });
      });
    }
  });

  return {
    status: 'processed',
    graph: { nodes, edges },
    quotes: generateQuotes(nodes),
  };
}
