const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  try {
  // find all categories
    const categoryData = await Category.findAll({
  // be sure to include its associated Products
      include: [{ model: Product }]
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
  // find one category by its `id` value
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }]
    });
    res.status(200).json(categoryData);
  // be sure to include its associated Products
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
  // create a new category
  const newCategory = await Category.create(req.body);
  res.status(200).json(newCategory);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
  // update a category by its `id` value
  await Category.update(req.body, {
    where: {
      id: req.params.id
    }
  });
  const updatedCategory = await Category.findByPk(req.params.id);
  res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Category.destroy({
      where: {
        id: req.params.id
      }
    });
    const newCatList = await Category.findAll();
    res.status(200).json(newCatList);
  // delete a category by its `id` value
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
