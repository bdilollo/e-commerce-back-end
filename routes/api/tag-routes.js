const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    // find all tags
    const tagData = await Tag.findAll({
    // be sure to include its associated Product data
      include: [{ model: Product, through: ProductTag }]
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    // find a single tag by its `id`
    const tagData = await Tag.findByPk(req.params.id, {
    // be sure to include its associated Product data
      include: [{ model: Product, through: ProductTag }]
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', (req, res) => {
  /* example req.body: 
  {
    tag_name: purple,
    productIds: [1,2,3]
  } 
  */
  // create a new tag
  Tag.create(req.body)
    .then((tag) => {
      if (req.body.productIds.length) {
        const productTagIdArr = req.body.productIds.map((product_id) => {
          return {
            tag_id: tag.id,
            product_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      res.status(200).json(tag);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(req.body, {
    where: {
      id: req.params.id
    }
  })
    .then((tag) => {
      return ProductTag.findAll({ where: { tag_id: req.params.id } });
    })
    .then((taggedProducts) => {
      const taggedProductIDs = taggedProducts.map(({ product_id }) => product_id);
      const newTaggedProducts = req.body.productIds
        .filter((product_id) => !taggedProductIDs.includes(product_id))
        .map((product_id) => {
          return {
            tag_id: req.params.id,
            product_id
          };
        });
        const taggedProductsToRemove = taggedProducts
          .filter(({ product_id }) => !req.body.productIds.includes(product_id))
          .map(({ id }) => id);
        return Promise.all([
          ProductTag.destroy({ where: { id: taggedProductsToRemove } }),
          ProductTag.bulkCreate(newTaggedProducts),
        ]);
    })
    .then((updatedTaggedProducts) => res.json(updatedTaggedProducts))
    .catch((err) => {
      res.status(400).json(err);
    });
  });

router.delete('/:id', async (req, res) => {
  try {
    // delete one tag by its `id` value
    await Tag.destroy({
      where: {
        id: req.params.id
      }
    });
    await ProductTag.destroy({
      where: {
        tag_id: req.params.id 
      }
    });
    // send new list (showing tag has been deleted)
    const newTagList = await Tag.findAll();
    res.status(200).json(newTagList);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
