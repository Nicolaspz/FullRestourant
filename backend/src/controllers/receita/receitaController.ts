import { Request, Response } from "express";
import { RecipeService } from "../../services/receita/createReceitaService";

class RecipeController {
  async addIngredient(req: Request, res: Response) {
    const { productId, ingredientId, quantity,impactaPreco } = req.body;

    const recipeService = new RecipeService();

    try {
      const created = await recipeService.execute({ productId, ingredientId, quantity,impactaPreco });
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async listRecipe(req: Request, res: Response) {
    console.log('Chegou no listRecipe'); 
    const { productId } = req.params;

    const recipeService = new RecipeService();

    try {
      const recipe = await recipeService.listRecipe(productId);
      return res.json(recipe);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async upsertIngredient(req: Request, res: Response) {
    const { productId, ingredientId, quantity,impactaPreco} = req.body;

    const recipeService = new RecipeService();

    try {
      const response = await recipeService.upsertRecipeItem(productId, ingredientId, quantity,impactaPreco);
      return res.json(response);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async removeIngredient(req: Request, res: Response) {
    const { id } = req.params;

    const recipeService = new RecipeService();

    try {
      const response = await recipeService.removeRecipeItem(id);
      return res.json(response);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { RecipeController };